// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { continueVectorShapeBuilderDrag } from '../continueVectorShapeBuilderDrag';
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointermove', { clientX: x, clientY: y, ...options });

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

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('continueVectorShapeBuilderDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should do nothing when no shape-builder drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    continueVectorShapeBuilderDrag(canvas, pointerEvent(10, 10), canvasRefs, setClassName);

    // result
    expect(canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current).toBeNull();
    expect(canvasRefs.shapeBuilder.touchedVectorShapeBuilderFacesRef.current).toEqual({});
    expect(setClassName).not.toHaveBeenCalled();
  });

  it("should append the new point, mark the touched face, and set the 'add' cursor, in freeform (non-shift) mode", () => {
    // mock
    const nodeId = addTriangleVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current = [{ x: 50, y: 40 }];

    // before
    continueVectorShapeBuilderDrag(canvas, pointerEvent(50, 45), canvasRefs, setClassName);

    // result
    expect(canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current).toEqual([
      { x: 50, y: 40 },
      { x: 50, y: 45 },
    ]);
    expect(canvasRefs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current).toBe(false);
    expect(canvasRefs.shapeBuilder.isVectorShapeBuilderSubtractRef.current).toBe(false);
    expect(canvasRefs.shapeBuilder.touchedVectorShapeBuilderFacesRef.current[nodeId].size).toBe(1);
    expect(setClassName).toHaveBeenCalledWith('add');
  });

  it('should hit-test against the swept box, not the raw path, while shift is held', () => {
    // mock — the box from the drag start (0,0) to the current point (100,100) fully contains the
    // triangle, even though neither endpoint lands inside it
    const nodeId = addTriangleVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current = [{ x: 0, y: 0 }];

    // before
    continueVectorShapeBuilderDrag(canvas, pointerEvent(100, 100, { shiftKey: true }), canvasRefs, setClassName);

    // result
    expect(canvasRefs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current).toBe(true);
    expect(canvasRefs.shapeBuilder.touchedVectorShapeBuilderFacesRef.current[nodeId].size).toBe(1);
  });

  it("should record subtract mode and set the 'remove' cursor while alt is held", () => {
    // mock
    const nodeId = addTriangleVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current = [{ x: 50, y: 40 }];

    // before
    continueVectorShapeBuilderDrag(canvas, pointerEvent(50, 45, { altKey: true }), canvasRefs, setClassName);

    // result
    expect(canvasRefs.shapeBuilder.isVectorShapeBuilderSubtractRef.current).toBe(true);
    expect(setClassName).toHaveBeenCalledWith('remove');
  });

  it('should keep a previously-touched face even once the path moves away from it', () => {
    // mock
    const nodeId = addTriangleVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current = [{ x: 50, y: 40 }];

    // before — first move touches the face, second move drags far away from it
    continueVectorShapeBuilderDrag(canvas, pointerEvent(50, 45), canvasRefs, setClassName);
    continueVectorShapeBuilderDrag(canvas, pointerEvent(900, 900), canvasRefs, setClassName);

    // result
    expect(canvasRefs.shapeBuilder.touchedVectorShapeBuilderFacesRef.current[nodeId].size).toBe(1);
  });
});
