// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { disarmVectorShapeBuilderDrag } from '../disarmVectorShapeBuilderDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const addTriangleVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('disarmVectorShapeBuilderDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no shape-builder drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    disarmVectorShapeBuilderDrag(canvas, pointerEvent(), store.dispatch, canvasRefs, setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should commit the touched faces, clear every shape-builder ref, release pointer capture, and restore the tool cursor', () => {
    // mock
    const nodeId = addTriangleVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs({
      isVectorShapeBuilderBoxModeRef: { current: true },
      isVectorShapeBuilderSubtractRef: { current: false },
      touchedVectorShapeBuilderFacesRef: { current: { [nodeId]: new Set(['s1,s2,s3']) } },
      vectorShapeBuilderPathRef: { current: [{ x: 50, y: 40 }] },
    });
    const setClassName = vi.fn();

    // before
    disarmVectorShapeBuilderDrag(canvas, pointerEvent(2), store.dispatch, canvasRefs, setClassName);

    // result
    expect(canvasRefs.vectorShapeBuilderPathRef.current).toBeNull();
    expect(canvasRefs.touchedVectorShapeBuilderFacesRef.current).toEqual({});
    expect(canvasRefs.isVectorShapeBuilderBoxModeRef.current).toBe(false);
    expect(canvasRefs.isVectorShapeBuilderSubtractRef.current).toBe(false);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith('add');
    expect(store.getState().design.nodes[nodeId]).toMatchObject({ filledFaceKeys: ['s1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]'] });
  });
});
