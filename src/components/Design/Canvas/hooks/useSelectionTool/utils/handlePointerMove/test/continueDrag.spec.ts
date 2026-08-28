import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { continueDrag } from '../continueDrag';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createDragStateRef = (dragState: Omit<TDragState, 'dispatchThrottle'> | null = null): RefObject<TDragState | null> => ({
  current: dragState && { ...dragState, dispatchThrottle: { frameId: null, run: null } },
});

const createCanvasRefs = (): TCanvasRefs =>
  ({
    transform: { draggedNodeIdsRef: { current: null } },
    vectorSnapshots: { draggedVectorNodeSnapshotsRef: { current: null } },
  }) as unknown as TCanvasRefs;

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
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
      fillColor: null,
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
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueDrag(canvas, pointerEvent(10, 10), store.dispatch, createDragStateRef(), createCanvasRefs());

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
    continueDrag(canvas, pointerEvent(10, 20), store.dispatch, dragStateRef, canvasRefs);
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA];

    expect(node).toMatchObject({ x: 110, y: 120 });
    expect(dragStateRef.current?.hasMoved).toBe(true);
    expect(canvasRefs.transform.draggedNodeIdsRef.current).toEqual(new Set([idA]));
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
    continueDrag(canvas, pointerEvent(5, 5), store.dispatch, dragStateRef, canvasRefs);
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
    continueDrag(canvas, pointerEvent(10, 5), store.dispatch, dragStateRef, canvasRefs);
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
    continueDrag(canvas, pointerEvent(10, 20), store.dispatch, dragStateRef, canvasRefs);

    // result
    expect(canvasRefs.transform.draggedNodeIdsRef.current).toBe(existingSet);
  });

  it('should skip dispatching a live update for a node that is snapshotted for a frozen drag, and update its snapshot delta directly instead', () => {
    // mock
    const idA = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const snapshot = { deltaX: 0, deltaY: 0, facesByColor: [], strokeColor: '#000000', strokeVertices: [] };

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
    continueDrag(canvas, pointerEvent(10, 5), store.dispatch, dragStateRef, canvasRefs);
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result
    expect(snapshot).toEqual({ deltaX: 10, deltaY: 5, facesByColor: [], strokeColor: '#000000', strokeVertices: [] });
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    });
  });
});
