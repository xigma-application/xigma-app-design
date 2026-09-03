import { RefObject } from 'react';

// store
import { addNode, deleteNode, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { continueDrag } from '../continueDrag';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';
import { getCandidateShapes } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointermove', { clientX: x, clientY: y, ...options });

// candidateShapes defaults to [] (no snap candidates) — the one test that exercises snapping passes
// its own, computed via getCandidateShapes the same way armDrag.ts does at arm time
type TDragStateFixture = Omit<TDragState, 'candidateShapes' | 'dispatchThrottle'> & { candidateShapes?: TDragState['candidateShapes'] };

const createDragStateRef = (dragState: TDragStateFixture | null = null): RefObject<TDragState | null> => ({
  current: dragState && { candidateShapes: [], ...dragState, dispatchThrottle: { frameId: null, run: null } },
});

const createCanvasRefs = (): TCanvasRefs =>
  ({
    transform: {
      alignmentGuideRef: { current: null },
      draggedNodeIdsRef: { current: null },
      dropTargetFrameIdRef: { current: null },
      equalSpacingGuidesRef: { current: null },
      matchedPairGuidesRef: { current: null },
    },
    vectorSnapshots: { draggedVectorNodeSnapshotsRef: { current: null } },
  }) as unknown as TCanvasRefs;

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: size,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addRectNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#00ff00', height: size, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: size, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addLineNode = (x1: number, y1: number, x2: number, y2: number): string => {
  store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('continueDrag', () => {
  const setClassName = vi.fn();

  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
    setClassName.mockClear();
  });

  it('should do nothing when no drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueDrag(canvas, pointerEvent(10, 10), store.dispatch, createDragStateRef(), createCanvasRefs(), setClassName);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it('should move a box node by the pointer delta and mark the drag as moved, dispatching once the throttled frame flushes', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: { [idA]: { x: 100, y: 100 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(10, 20), store.dispatch, dragStateRef, canvasRefs, setClassName);
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA];

    expect(node).toMatchObject({ x: 110, y: 120 });
    expect(dragStateRef.current?.hasMoved).toBe(true);
    expect(canvasRefs.transform.draggedNodeIdsRef.current).toEqual(new Set([idA]));
    expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
  });

  it('should lock movement to the horizontal axis while Shift is held on a predominantly horizontal drag, switching the cursor to move-x', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: { [idA]: { x: 100, y: 100 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(30, 10, { shiftKey: true }), store.dispatch, dragStateRef, canvasRefs, setClassName);
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result — the vertical component is dropped entirely, not just reduced
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA];

    expect(node).toMatchObject({ x: 130, y: 100 });
    expect(setClassName).toHaveBeenCalledWith('move-x');
  });

  it('should lock movement to the vertical axis while Shift is held on a predominantly vertical drag, switching the cursor to move-y', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: { [idA]: { x: 100, y: 100 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(10, 30, { shiftKey: true }), store.dispatch, dragStateRef, canvasRefs, setClassName);
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA];

    expect(node).toMatchObject({ x: 100, y: 130 });
    expect(setClassName).toHaveBeenCalledWith('move-y');
  });

  it('should move freely on both axes while Shift is held below the axis-lock threshold, not yet committing to either axis', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: { [idA]: { x: 100, y: 100 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(2, 1, { shiftKey: true }), store.dispatch, dragStateRef, canvasRefs, setClassName);
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA];

    expect(node).toMatchObject({ x: 102, y: 101 });
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should clear the axis-lock cursor and resume free movement the instant Shift is released mid-drag', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: { [idA]: { x: 100, y: 100 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(30, 10, { shiftKey: true }), store.dispatch, dragStateRef, canvasRefs, setClassName);

    expect(setClassName).toHaveBeenLastCalledWith('move-x');

    // action — Shift released, still moving
    continueDrag(canvas, pointerEvent(30, 10, { shiftKey: false }), store.dispatch, dragStateRef, canvasRefs, setClassName);
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result — both axes move again, and the cursor reverts
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA];

    expect(node).toMatchObject({ x: 130, y: 110 });
    expect(setClassName).toHaveBeenLastCalledWith(null);
  });

  it('should suppress the alignment guide and keep the locked axis exactly at the anchor while Shift is held, even when it would otherwise have snapped', () => {
    // mock — idB's center-x (22) sits 2px off idA's own center-x (20), well within tolerance: an
    // un-locked vertical drag would pull it in and center it exactly, snapping x from 2 down to 0
    addRectNode(0, 0, 40);

    const idB = addRectNode(2, 80, 40);
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      candidateShapes: getCandidateShapes(selectActivePage(store.getState()).nodes, [idB]),
      hasMoved: false,
      nodeOrigins: { [idB]: { x: 2, y: 80 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before — predominantly vertical, so the axis lock should keep x pinned at 2 regardless
    continueDrag(canvas, pointerEvent(1, 30, { shiftKey: true }), store.dispatch, dragStateRef, canvasRefs, setClassName);
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toMatchObject({ x: 2, y: 110 });
    expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
  });

  it('should snap a dragged box onto a stationary one within tolerance, correcting the dispatched position and populating the guide ref', () => {
    // mock — a raw +2 delta puts the dragged rect's right edge (0+20+2=22) 1px short of the
    // stationary rect's left edge (23), within ALIGNMENT_SNAP_TOLERANCE_PX
    const idA = addRectNode(0, 0);

    addRectNode(23, 0);

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      candidateShapes: getCandidateShapes(selectActivePage(store.getState()).nodes, [idA]),
      hasMoved: false,
      nodeOrigins: { [idA]: { x: 0, y: 0 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(2, 0), store.dispatch, dragStateRef, canvasRefs, setClassName);
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result — corrected by +1 so the edges land flush (x: 3, right edge: 23), and the guide is populated
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({ x: 3, y: 0 });
    expect(canvasRefs.transform.alignmentGuideRef.current).not.toBeNull();
  });

  it("should snap a dragged box onto matching its neighbour's own established gap to a third, differently-sized box, populating the guide ref", () => {
    // mock — square1 (30x30) and square2 (50x50) sit with a 10px gap; square3 (20x20) is dragged to
    // x:98, 2px short of the x:100 that would give it the same 10px gap to square2
    const idA = addRectNode(0, 0, 30);

    addRectNode(40, 0, 50);

    const idC = addRectNode(98, 0, 20);
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      candidateShapes: getCandidateShapes(selectActivePage(store.getState()).nodes, [idC]),
      hasMoved: false,
      nodeOrigins: { [idC]: { x: 98, y: 0 } },
      pendingClickAction: null,
      pointerStart: { x: 98, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(98, 0), store.dispatch, dragStateRef, canvasRefs, setClassName);
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result — corrected to x:100 so the gap matches, and the guide ref is populated with both gaps
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idC]).toMatchObject({ x: 100, y: 0 });
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({ x: 0, y: 0 });
    expect(canvasRefs.transform.equalSpacingGuidesRef.current?.lines).toHaveLength(2);
  });

  it('should populate the matched-pair guide ref and suppress the alignment guide when the dragged box lands centred on a same-size neighbour', () => {
    // mock — a 40x40 stationary box, and a same-size box dragged to sit centred below it with a gap
    addRectNode(0, 0, 40);

    const idB = addRectNode(0, 80, 40);
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      candidateShapes: getCandidateShapes(selectActivePage(store.getState()).nodes, [idB]),
      hasMoved: false,
      nodeOrigins: { [idB]: { x: 0, y: 80 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 80 },
    });

    // before — no movement; the box already sits centred (same x) below the stationary one
    continueDrag(canvas, pointerEvent(0, 80), store.dispatch, dragStateRef, canvasRefs, setClassName);

    // result — matched-pair guides drawn (centre line + 2 edges), alignment guide left blank
    expect(canvasRefs.transform.matchedPairGuidesRef.current?.lines).toHaveLength(3);
    expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
  });

  it('should move a line node endpoints by the pointer delta', () => {
    // mock
    const idA = addLineNode(200, 200, 250, 200);
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: { [idA]: { x1: 200, x2: 250, y1: 200, y2: 200 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(5, 5), store.dispatch, dragStateRef, canvasRefs, setClassName);
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA];

    expect(node).toMatchObject({ x1: 205, x2: 255, y1: 205, y2: 205 });
  });

  it('should translate a vector node vertices by the pointer delta', () => {
    // mock
    const idA = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: {
        [idA]: { segments: {}, vertices: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 } } },
      },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(10, 5), store.dispatch, dragStateRef, canvasRefs, setClassName);
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA];

    expect(node).toMatchObject({
      vertices: { v1: { id: 'v1', x: 10, y: 5 }, v2: { id: 'v2', x: 110, y: 5 } },
    });
  });

  it('should not replace an already-initialized dragged-node-ids set on a subsequent pointermove', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const existingSet = new Set(['some-other-id']);

    canvasRefs.transform.draggedNodeIdsRef.current = existingSet;

    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: { [idA]: { x: 100, y: 100 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(10, 20), store.dispatch, dragStateRef, canvasRefs, setClassName);

    // result
    expect(canvasRefs.transform.draggedNodeIdsRef.current).toBe(existingSet);
  });

  it('should skip dispatching a live update for a node that is snapshotted for a frozen drag, and update its snapshot delta directly instead', () => {
    // mock
    const idA = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const snapshot = { deltaX: 0, deltaY: 0, facesByPaint: [], strokeColor: '#000000', strokeVertices: [] };

    canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current = new Map([[idA, snapshot]]);

    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: {
        [idA]: { segments: {}, vertices: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 } } },
      },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(10, 5), store.dispatch, dragStateRef, canvasRefs, setClassName);
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result
    expect(snapshot).toEqual({ deltaX: 10, deltaY: 5, facesByPaint: [], strokeColor: '#000000', strokeVertices: [] });
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    });
  });

  it('should reparent the dragged node into the frame under the pointer in real time, before pointer-up', () => {
    // mock — a 20x20 rect being dragged with the pointer landing inside a 300x300 frame
    const rectId = addRectNode(0, 0, 20);
    const frameId = addFrameNode(200, 0, 300);

    store.dispatch(setSelection([rectId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: { [rectId]: { x: 0, y: 0 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    continueDrag(canvas, pointerEvent(300, 50), store.dispatch, dragStateRef, canvasRefs, setClassName);

    // result — highlighted, and already reparented in the store
    const page = selectActivePage(store.getState());
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe(frameId);
    expect(page.nodes[rectId].parentId).toBe(frameId);
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toContain(rectId);
    expect(page.rootOrder).not.toContain(rectId);
  });

  it('should reparent the dragged node back to the root in real time once the pointer leaves the frame', () => {
    // mock — rect starts life inside the frame
    const frameId = addFrameNode(0, 0, 100);
    const rectId = addRectNode(20, 20, 20);

    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(setSelection([rectId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: { [rectId]: { x: 20, y: 20 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before — pointer dragged out onto empty canvas
    continueDrag(canvas, pointerEvent(400, 400), store.dispatch, dragStateRef, canvasRefs, setClassName);

    // result
    const page = selectActivePage(store.getState());
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBeNull();
    expect(page.nodes[rectId].parentId).toBeNull();
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).not.toContain(rectId);
    expect(page.rootOrder).toContain(rectId);
  });

  it('should not re-dispatch a reparent while the pointer keeps moving inside the frame it is already parented to', () => {
    // mock
    const frameId = addFrameNode(0, 0, 300);
    const rectId = addRectNode(20, 20, 20);

    store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(setSelection([rectId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dragStateRef = createDragStateRef({
      hasMoved: false,
      nodeOrigins: { [rectId]: { x: 20, y: 20 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    // before — two moves, both landing inside the same frame
    continueDrag(canvas, pointerEvent(100, 100), store.dispatch, dragStateRef, canvasRefs, setClassName);
    continueDrag(canvas, pointerEvent(150, 150), store.dispatch, dragStateRef, canvasRefs, setClassName);

    // result — no moveNodes action was dispatched
    expect(dispatchSpy.mock.calls.some(([action]) => (action as { type: string }).type === moveNodes.type)).toBe(false);
    expect(selectActivePage(store.getState()).nodes[rectId].parentId).toBe(frameId);

    dispatchSpy.mockRestore();
  });
});
