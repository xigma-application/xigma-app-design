import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorCutDragState } from 'types/design/selectionTool/types';

// utils
import { continueVectorCutDrag } from '../continueVectorCutDrag';
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createVectorCutDragRef = (value: TVectorCutDragState | null = null): RefObject<TVectorCutDragState | null> => ({ current: value });

const addSquareNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
        s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 100, y: 100 }, d: { id: 'd', x: 0, y: 100 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueVectorCutDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should do nothing when no cut drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const vectorCutDragRef = createVectorCutDragRef();

    // before
    continueVectorCutDrag(canvas, pointerEvent(50, 0), canvasRefs, vectorCutDragRef);

    // result
    expect(canvasRefs.vectorCutPreviewRef.current).toBeNull();
  });

  it('should stay "pending", writing no preview, while the drag has not yet crossed the minimum distance threshold', () => {
    // mock
    const nodeId = addSquareNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const vectorCutDragRef = createVectorCutDragRef({
      hit: { nodeId, segmentId: 's4', t: 0.5 },
      lineStart: { x: -20, y: 50 },
      status: 'pending',
    });

    // before — moved just 1px, below MIN_DRAG_DISTANCE_PX
    continueVectorCutDrag(canvas, pointerEvent(-19, 50), canvasRefs, vectorCutDragRef);

    // result
    expect(vectorCutDragRef.current!.status).toBe('pending');
    expect(canvasRefs.vectorCutPreviewRef.current).toBeNull();
  });

  it('should flip to "dividing" and populate live crossing markers once the drag crosses the threshold', () => {
    // mock — square at (0,0)-(100,100), horizontal line dragged from (-20,50) toward (60,50)
    const nodeId = addSquareNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const vectorCutDragRef = createVectorCutDragRef({
      hit: { nodeId, segmentId: 's4', t: 0.5 },
      lineStart: { x: -20, y: 50 },
      status: 'pending',
    });

    // before
    continueVectorCutDrag(canvas, pointerEvent(60, 50), canvasRefs, vectorCutDragRef);

    // result
    expect(vectorCutDragRef.current).toEqual({ lineStart: { x: -20, y: 50 }, status: 'dividing' });
    expect(canvasRefs.vectorCutPreviewRef.current).toMatchObject({ lineEnd: { x: 60, y: 50 }, lineStart: { x: -20, y: 50 } });
    // crosses the left edge (s4, x=0) — the right edge (s2, x=100) is still ahead of the current pointer
    expect(canvasRefs.vectorCutPreviewRef.current!.crossings).toHaveLength(1);
    expect(canvasRefs.vectorCutPreviewRef.current!.crossings[0]).toMatchObject({ nodeId, segmentId: 's4' });
  });

  it('should skip an open node id that no longer resolves to a real vector node, without crashing', () => {
    // mock — one real node plus a stale id that resolves to nothing
    const nodeId = addSquareNode();

    store.dispatch(setVectorEditingNodeIds([nodeId, 'stale-id']));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const vectorCutDragRef = createVectorCutDragRef({ lineStart: { x: -20, y: 50 }, status: 'dividing' });

    // before
    continueVectorCutDrag(canvas, pointerEvent(60, 50), canvasRefs, vectorCutDragRef);

    // result — the real node's crossing is still found, the stale id contributes nothing
    expect(canvasRefs.vectorCutPreviewRef.current!.crossings).toHaveLength(1);
    expect(canvasRefs.vectorCutPreviewRef.current!.crossings[0]).toMatchObject({ nodeId, segmentId: 's4' });
  });

  it('should keep re-deriving crossings fresh on every subsequent frame once already "dividing"', () => {
    // mock
    const nodeId = addSquareNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const vectorCutDragRef = createVectorCutDragRef({ lineStart: { x: -20, y: 50 }, status: 'dividing' });

    // before — now past the right edge too
    continueVectorCutDrag(canvas, pointerEvent(120, 50), canvasRefs, vectorCutDragRef);

    // result — both edges now crossed
    expect(canvasRefs.vectorCutPreviewRef.current!.crossings.map((crossing) => crossing.segmentId).sort()).toEqual(['s2', 's4']);
  });
});
