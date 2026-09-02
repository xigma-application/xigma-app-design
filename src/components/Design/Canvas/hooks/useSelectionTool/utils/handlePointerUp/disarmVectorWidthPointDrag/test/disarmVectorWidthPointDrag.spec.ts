// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { disarmVectorWidthPointDrag } from '../disarmVectorWidthPointDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const addLineVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 4,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('disarmVectorWidthPointDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should do nothing when no width-point drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    disarmVectorWidthPointDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should commit the dragged point, clear the drag ref, release the pointer, and reset the cursor', () => {
    // mock
    const nodeId = addLineVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    canvasRefs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: true,
      nodeId,
      point: { id: 'p1', leftOffset: 6, position: 0.5, rightOffset: 6 },
      target: 'right',
    };
    canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [
      { nodeId, pointId: 'p1', side: 'left' },
      { nodeId, pointId: 'p1', side: 'right' },
    ];

    // before
    disarmVectorWidthPointDrag(canvas, pointerEvent(7), store.dispatch, canvasRefs, setClassName);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toMatchObject({
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 6, position: 0.5, rightOffset: 6 } } },
    });
    expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toBeNull();
    // selection persists after release — it's only cleared by clicking elsewhere or another point
    expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual([
      { nodeId, pointId: 'p1', side: 'left' },
      { nodeId, pointId: 'p1', side: 'right' },
    ]);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(7);
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should still clear the ref, release the pointer, and reset the cursor when the node no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();
    const dispatch = vi.fn();

    canvasRefs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: true,
      nodeId: 'missing-node',
      point: { id: 'p1', leftOffset: 6, position: 0.5, rightOffset: 6 },
      target: 'right',
    };
    canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId: 'missing-node', pointId: 'p1', side: 'left' }];

    // before
    disarmVectorWidthPointDrag(canvas, pointerEvent(), dispatch, canvasRefs, setClassName);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toBeNull();
    expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual([{ nodeId: 'missing-node', pointId: 'p1', side: 'left' }]);
    expect(canvas.releasePointerCapture).toHaveBeenCalled();
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
