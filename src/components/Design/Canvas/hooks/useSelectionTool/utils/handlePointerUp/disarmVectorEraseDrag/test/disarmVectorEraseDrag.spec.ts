// store
import { addNode, setVectorEditingNodeIds, setViewport } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { createSelectionToolRefs } from '../../../../hooks/useSelectionToolRefs/createSelectionToolRefs';
import { disarmVectorEraseDrag } from '../disarmVectorEraseDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerUp = (): PointerEvent => new PointerEvent('pointerup', { pointerId: 1 });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: '#000000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const currentNode = (id: string): TVectorNode => store.getState().design.nodes[id] as TVectorNode;

describe('disarmVectorEraseDrag', () => {
  beforeEach(() => store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 })));
  afterEach(() => store.dispatch(setVectorEditingNodeIds([])));

  it('should do nothing when no erase drag is armed', () => {
    // mock
    const canvas = createCanvas();
    const setClassName = vi.fn();

    // action
    disarmVectorEraseDrag(canvas, pointerUp(), store.dispatch, createCanvasRefs(), createSelectionToolRefs(), setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should commit the whole recorded stroke, clear the preview, release the pointer and keep the erase cursor', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const setClassName = vi.fn();
    const canvasRefs = createCanvasRefs({
      eraserDiameterRef: { current: 24 },
      vectorEraseStrokeRef: {
        current: [
          { x: 40, y: 0 },
          { x: 60, y: 0 },
        ],
      },
    });
    const selectionRefs = createSelectionToolRefs({
      vectorEraseDragRef: { current: { axisLock: null, lastPoint: { x: 60, y: 0 }, shiftAnchor: null } },
    });

    // action
    disarmVectorEraseDrag(canvas, pointerUp(), store.dispatch, canvasRefs, selectionRefs, setClassName);

    // result — the [40, 60] stretch is gone (two stubs), preview + drag cleared
    expect(Object.keys(currentNode(nodeId).segments)).toHaveLength(2);
    expect(canvasRefs.vectorEraseStrokeRef.current).toBeNull();
    expect(selectionRefs.vectorEraseDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(setClassName).toHaveBeenCalledWith('erase');
  });
});
