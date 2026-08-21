import { RefObject } from 'react';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeId, updateNode } from 'store/design/slice';
import { store } from 'store';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { continueVectorMarqueeDrag } from '../continueVectorMarqueeDrag';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorMarqueeMode } from 'types/design/selectionTool/types';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createVectorMarqueeStartRef = (point: TPoint | null = null): RefObject<TPoint | null> => ({ current: point });
const createVectorMarqueeModeRef = (mode: TVectorMarqueeMode | null = null): RefObject<TVectorMarqueeMode | null> => ({ current: mode });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 500, y: 500 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueVectorMarqueeDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should do nothing when no vector marquee is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    continueVectorMarqueeDrag(canvas, pointerEvent(10, 10), canvasRefs, createVectorMarqueeStartRef(), createVectorMarqueeModeRef());

    // result
    expect(canvasRefs.marqueeRef.current).toBeNull();
  });

  it('should do nothing when no node is currently in Vector Edit Mode', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    continueVectorMarqueeDrag(
      canvas,
      pointerEvent(10, 10),
      canvasRefs,
      createVectorMarqueeStartRef({ x: 0, y: 0 }),
      createVectorMarqueeModeRef(),
    );

    // result
    expect(canvasRefs.marqueeRef.current).toBeNull();
  });

  it('should draw the marquee rect and select the vertex whose point falls inside it, clearing any handle selection', () => {
    // mock — v1(0,0)/v2(100,0); v3(500,500) stays outside; s1's real tangentStart handle also sits at (5,0) but must not be selected
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before — marquee (0,0) -> (5,0): a thin sliver that only ever contains v1 (and s1's tangentStart handle at (5,0))
    continueVectorMarqueeDrag(
      canvas,
      pointerEvent(5, 0),
      canvasRefs,
      createVectorMarqueeStartRef({ x: 0, y: 0 }),
      createVectorMarqueeModeRef(),
    );

    // result
    expect(canvasRefs.marqueeRef.current).toEqual({ height: 0, width: 5, x: 0, y: 0 });
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
  });

  it('should select nothing when the marquee misses every point, handle, and segment', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before — marquee far away from every vertex/handle/segment
    continueVectorMarqueeDrag(
      canvas,
      pointerEvent(2000, 2000),
      canvasRefs,
      createVectorMarqueeStartRef({ x: 1900, y: 1900 }),
      createVectorMarqueeModeRef(),
    );

    // result
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should catch a tangent handle once no point is caught, matching Figma — a point catch always wins, but a handle/segment catch unlocks everything', () => {
    // mock — v1(0,0)-v2(10,0), s1's tangentStart handle sits far away at (5,100); the curve itself
    // (max height ~44.4 at its own peak) never reaches the marquee's y range, so this box catches only
    // the handle, no vertex and no segment. penActiveVertexId keeps v1 visually active (mirrors leaving
    // the Pen tool mid-draw), which is what makes this handle visible/catchable in the first place
    const nodeId = addVectorNode();

    store.dispatch(
      updateNode({
        changes: { segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 100 } } } },
        id: nodeId,
      }),
    );
    store.dispatch(setVectorEditingNodeId(nodeId));
    store.dispatch(setPenActiveVertexId('v1'));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before — marquee (3,95) -> (7,105)
    continueVectorMarqueeDrag(
      canvas,
      pointerEvent(7, 105),
      canvasRefs,
      createVectorMarqueeStartRef({ x: 3, y: 95 }),
      createVectorMarqueeModeRef(),
    );

    // result
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should NOT catch a tangent handle that is not currently visible, even though its position falls inside the box', () => {
    // mock — same far-away handle as above, but with nothing selected and no Pen active vertex: the
    const nodeId = addVectorNode();

    store.dispatch(
      updateNode({
        changes: { segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 100 } } } },
        id: nodeId,
      }),
    );
    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before — same marquee (3,95) -> (7,105) that caught the handle above
    continueVectorMarqueeDrag(
      canvas,
      pointerEvent(7, 105),
      canvasRefs,
      createVectorMarqueeStartRef({ x: 3, y: 95 }),
      createVectorMarqueeModeRef(),
    );

    // result — nothing caught at all, since the handle isn't visible and no vertex/segment is under the box either
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should catch a tangent handle revealed only by the pre-marquee vertex snapshot — the vertex a click already deselected when the marquee was armed, but whose tangents must stay catchable for the rest of the gesture', () => {
    // mock — same far-away handle as above (v1's s1 tangentStart at (5,100)), but this time nothing is
    // selected in the live refs at all (as armVectorMarqueeOnPointerDown.ts leaves them once it clears the
    // click-time selection) and there's no Pen active vertex either. preVectorMarqueeVertexIdsRef holds
    // ['v1'] instead — the snapshot armVectorMarqueeOnPointerDown.ts takes of the selection right before
    // clearing it — which is what must make s1's tangentStart visible/catchable here
    const nodeId = addVectorNode();

    store.dispatch(
      updateNode({
        changes: { segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 100 } } } },
        id: nodeId,
      }),
    );
    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs({ preVectorMarqueeVertexIdsRef: { current: ['v1'] } });

    // before — same marquee (3,95) -> (7,105) that caught the handle in the penActiveVertexId test above
    continueVectorMarqueeDrag(
      canvas,
      pointerEvent(7, 105),
      canvasRefs,
      createVectorMarqueeStartRef({ x: 3, y: 95 }),
      createVectorMarqueeModeRef(),
    );

    // result — the handle is caught even though v1 itself is not (and stays) deselected
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should catch a tangent handle revealed only by the pre-marquee segment snapshot — a segment a click already deselected when the marquee was armed, but whose tangents must stay catchable for the rest of the gesture', () => {
    // mock — same far-away handle as above (s1's tangentStart at (5,100)), but this time nothing is
    // selected in the live refs at all and there's no Pen active vertex either. preVectorMarqueeSegmentIdsRef
    // holds ['s1'] instead — the snapshot armVectorMarqueeOnPointerDown.ts takes of the segment selection
    // right before clearing it — which is what must make s1's tangentStart visible/catchable here
    const nodeId = addVectorNode();

    store.dispatch(
      updateNode({
        changes: { segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 100 } } } },
        id: nodeId,
      }),
    );
    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs({ preVectorMarqueeSegmentIdsRef: { current: ['s1'] } });

    // before — same marquee (3,95) -> (7,105) that caught the handle in the vertex-snapshot test above
    continueVectorMarqueeDrag(
      canvas,
      pointerEvent(7, 105),
      canvasRefs,
      createVectorMarqueeStartRef({ x: 3, y: 95 }),
      createVectorMarqueeModeRef(),
    );

    // result — the handle is caught even though s1 itself is not (and stays) deselected
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should catch a segment via its own bounding box once no point is caught, even over its middle', () => {
    // mock — v1(0,0)-v2(100,0), plain straight segment; a box over its middle touches neither endpoint
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before — marquee (45,-5) -> (55,5), well clear of v1(0,0)/v2(100,0)/v3(500,500)
    continueVectorMarqueeDrag(
      canvas,
      pointerEvent(55, 5),
      canvasRefs,
      createVectorMarqueeStartRef({ x: 45, y: -5 }),
      createVectorMarqueeModeRef(),
    );

    // result
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
  });

  it("should NOT reveal or catch a segment's own tangent handle just because the marquee caught the segment itself, with neither endpoint vertex ever caught", () => {
    // mock — same straight-along-y=0 setup: v1(0,0)-v2(100,0), s1's tangentStart handle at (5,0).
    const nodeId = addVectorNode();

    store.dispatch(
      updateNode({
        changes: { segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } } },
        id: nodeId,
      }),
    );
    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before — box (3,-1)->(7,1): sits right over the handle's own position (5,0) and over the segment's
    continueVectorMarqueeDrag(
      canvas,
      pointerEvent(7, 1),
      canvasRefs,
      createVectorMarqueeStartRef({ x: 3, y: -1 }),
      createVectorMarqueeModeRef(),
    );

    // result — the segment itself is caught (unlocking "everything"), but the handle stays excluded
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
  });

  it("should NOT reveal or catch a segment's own tangent handle even once the segment is caught first and its own vertex is caught right after — vertex/segment catches never cascade into handles", () => {
    // mock — v1(0,0)-v2(100,0), s1's tangentStart handle sits at (5,0); tangentStart shares v1/v2's own
    // y=0, so the "curve" flattens to a plain line along y=0 the whole way
    const nodeId = addVectorNode();

    store.dispatch(
      updateNode({
        changes: { segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } } },
        id: nodeId,
      }),
    );
    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const marqueeStartRef = createVectorMarqueeStartRef({ x: 48, y: -2 });
    const marqueeModeRef = createVectorMarqueeModeRef();

    // before — first frame: box (48,-2)->(52,2) over the segment's own middle only, unlocking "everything"
    continueVectorMarqueeDrag(canvas, pointerEvent(52, 2), canvasRefs, marqueeStartRef, marqueeModeRef);
    expect(marqueeModeRef.current).toBe('everything');
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);

    // action — grow the box to (0,-2)->(10,2): now covers v1, s1's own body, AND s1's tangentStart
    // handle (5,0) all at once. v1 arriving as the gesture's first point, with exactly one segment (s1)
    // selected, also triggers the separate single-segment-to-point handoff (shouldHandOffSingleSegmentToPoint.ts)
    marqueeStartRef.current = { x: 0, y: -2 };
    continueVectorMarqueeDrag(canvas, pointerEvent(10, 2), canvasRefs, marqueeStartRef, marqueeModeRef);

    // result — v1 is kept, s1 is dropped by the handoff (not just the handle) — the handle was never
    // going to be caught here regardless of the handoff, per this test's own claim
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(marqueeModeRef.current).toBe('points');
  });

  it('should drop the single selected segment and lock to points-only the first time a point arrives, keeping just the point', () => {
    // mock — v1(0,0)-v2(100,0), plain straight segment
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const marqueeStartRef = createVectorMarqueeStartRef({ x: 45, y: -5 });
    const marqueeModeRef = createVectorMarqueeModeRef();

    // before — first frame: box over the segment's own middle only, unlocking "everything"
    continueVectorMarqueeDrag(canvas, pointerEvent(55, 5), canvasRefs, marqueeStartRef, marqueeModeRef);
    expect(marqueeModeRef.current).toBe('everything');
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);

    // action — grow the box to also cover v1(0,0), the gesture's first point
    marqueeStartRef.current = { x: 0, y: -5 };
    continueVectorMarqueeDrag(canvas, pointerEvent(55, 5), canvasRefs, marqueeStartRef, marqueeModeRef);

    // result — the point takes over: s1 is dropped, only v1 stays selected, and the gesture is now
    // locked to points-only for good
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(marqueeModeRef.current).toBe('points');

    // and — growing the box further to also cover a second segment must not bring any segment back
    marqueeStartRef.current = { x: -10, y: -110 };
    continueVectorMarqueeDrag(canvas, pointerEvent(60, 5), canvasRefs, marqueeStartRef, marqueeModeRef);
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(marqueeModeRef.current).toBe('points');
  });

  it('should drop both segments and lock to points-only once a point arrives, even with two segments already selected', () => {
    // mock — two disjoint straight segments stacked at different y so one box can cover both middles
    // (x 45-55) without ever touching any of their four endpoint vertices
    store.dispatch(
      addNode({
        fillColor: null,
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: {
          s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
          s2: { endId: 'v4', id: 's2', startId: 'v3', tangentEnd: null, tangentStart: null },
        },
        strokeColor: '#000000',
        strokeWidth: 1,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: {
          v1: { id: 'v1', x: 0, y: 0 },
          v2: { id: 'v2', x: 100, y: 0 },
          v3: { id: 'v3', x: 0, y: 20 },
          v4: { id: 'v4', x: 100, y: 20 },
        },
      }),
    );

    const { rootOrder } = store.getState().design;
    const nodeId = rootOrder[rootOrder.length - 1];

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const marqueeStartRef = createVectorMarqueeStartRef({ x: 45, y: -2 });
    const marqueeModeRef = createVectorMarqueeModeRef();

    // before — first frame: a tall thin box over both segments' own middles, no vertex touched
    continueVectorMarqueeDrag(canvas, pointerEvent(55, 22), canvasRefs, marqueeStartRef, marqueeModeRef);
    expect(marqueeModeRef.current).toBe('everything');
    expect(canvasRefs.selectedVectorSegmentIdsRef.current.sort()).toEqual(['s1', 's2']);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);

    // action — grow the box to also cover v1(0,0) and v3(0,20), the gesture's first points
    marqueeStartRef.current = { x: 0, y: -2 };
    continueVectorMarqueeDrag(canvas, pointerEvent(55, 22), canvasRefs, marqueeStartRef, marqueeModeRef);

    // result — the points take over: both segments are dropped regardless of how many were selected,
    // only the newly-caught points stay selected, and the gesture locks to points-only
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorVertexIdsRef.current.sort()).toEqual(['v1', 'v3']);
    expect(marqueeModeRef.current).toBe('points');
  });

  it('should stay locked to points-only for the rest of the gesture once a point is caught first, even once the box grows to also cover a handle', () => {
    // mock — v1(0,0)/v2(100,0); s1's tangentStart handle sits at (5,0)
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const marqueeStartRef = createVectorMarqueeStartRef({ x: 0, y: 0 });
    const marqueeModeRef = createVectorMarqueeModeRef();

    // before — first frame: a tiny box that only ever catches v1, locking the gesture to points-only
    continueVectorMarqueeDrag(canvas, pointerEvent(2, 2), canvasRefs, marqueeStartRef, marqueeModeRef);
    expect(marqueeModeRef.current).toBe('points');

    // action — grow the same box to also cover the handle at (5,0)
    continueVectorMarqueeDrag(canvas, pointerEvent(10, 10), canvasRefs, marqueeStartRef, marqueeModeRef);

    // result — still points-only: the handle stays excluded even though it now falls inside the box too
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([]);
    expect(marqueeModeRef.current).toBe('points');
  });

  it('should lock to handles-only for the rest of the gesture once a handle is caught first, dropping a point that enters the box afterward — nothing else may share the list with a caught handle', () => {
    // mock — same handle-far-from-the-curve setup as the handle-only test above, kept visible via
    const nodeId = addVectorNode();

    store.dispatch(
      updateNode({
        changes: { segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 100 } } } },
        id: nodeId,
      }),
    );
    store.dispatch(setVectorEditingNodeId(nodeId));
    store.dispatch(setPenActiveVertexId('v1'));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const marqueeStartRef = createVectorMarqueeStartRef({ x: 3, y: 95 });
    const marqueeModeRef = createVectorMarqueeModeRef();

    // before — first frame: catches only the handle, locking the gesture to "handles"
    continueVectorMarqueeDrag(canvas, pointerEvent(7, 105), canvasRefs, marqueeStartRef, marqueeModeRef);
    expect(marqueeModeRef.current).toBe('handles');

    // action — grow the box out to also cover v3(500,500), the fixture's own unrelated third vertex.
    // The box's y range deliberately stays at/above 95 throughout (never dips down toward y=0) so it
    // never also sweeps across the curve's own peak (~44 at its highest, well short of the handle's own
    // position at (5,100)) — that would incidentally catch s1 itself, irrelevant now that a handle already
    // outranks a segment catch too
    marqueeStartRef.current = { x: 3, y: 95 };
    continueVectorMarqueeDrag(canvas, pointerEvent(500, 500), canvasRefs, marqueeStartRef, marqueeModeRef);

    // result — v3 is dropped: once a handle is caught, nothing else may join the selection, not even a
    // point that enters the box afterward ("Jak zaznaczamy tangeny to nic innego nie może wtedy być w tej
    // liście, nawet pointy")
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(marqueeModeRef.current).toBe('handles');
  });

  it('should promote a locked points-only gesture to handles-only the moment the box also catches a visible handle, dropping every point already selected', () => {
    // mock — v1(0,0)/v2(100,0), s1's tangentStart handle at (5,0); penActiveVertexId keeps it visible
    // throughout (mirrors leaving the Pen tool mid-draw), same as the handle-catches-alone test above
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));
    store.dispatch(setPenActiveVertexId('v1'));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const marqueeStartRef = createVectorMarqueeStartRef({ x: -2, y: -2 });
    const marqueeModeRef = createVectorMarqueeModeRef();

    // before — first frame: a tiny box that only ever catches v1, locking the gesture to points-only
    continueVectorMarqueeDrag(canvas, pointerEvent(2, 2), canvasRefs, marqueeStartRef, marqueeModeRef);
    expect(marqueeModeRef.current).toBe('points');
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);

    // action — grow the same box to also cover the handle at (5,0)
    continueVectorMarqueeDrag(canvas, pointerEvent(10, 10), canvasRefs, marqueeStartRef, marqueeModeRef);

    // result — the handle outranks the already-locked points mode: v1 is dropped, only the handle stays
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(marqueeModeRef.current).toBe('handles');
  });
});
