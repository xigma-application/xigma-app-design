import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeId, updateNode } from 'store/design/slice';
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
    // the handle, no vertex and no segment
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

  it('should unlock to catching everything for the rest of the gesture once a handle is caught first, adding a point that enters the box afterward', () => {
    // mock — same handle-far-from-the-curve setup as the handle-only test above
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
    const marqueeStartRef = createVectorMarqueeStartRef({ x: 3, y: 95 });
    const marqueeModeRef = createVectorMarqueeModeRef();

    // before — first frame: catches only the handle, unlocking the gesture to "everything"
    continueVectorMarqueeDrag(canvas, pointerEvent(7, 105), canvasRefs, marqueeStartRef, marqueeModeRef);
    expect(marqueeModeRef.current).toBe('everything');

    // action — grow the box (by moving its start corner) to also cover v1(0,0)
    marqueeStartRef.current = { x: -5, y: -5 };
    continueVectorMarqueeDrag(canvas, pointerEvent(7, 105), canvasRefs, marqueeStartRef, marqueeModeRef);

    // result — v1 gets added alongside the still-selected handle, not swapped in exclusively
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(marqueeModeRef.current).toBe('everything');
  });
});
