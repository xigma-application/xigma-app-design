// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { continueVectorLassoDrag } from '../continueVectorLassoDrag';
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 20, y: 20 }, v2: { id: 'v2', x: 500, y: 500 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueVectorLassoDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should do nothing when no lasso drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    continueVectorLassoDrag(canvas, pointerEvent(10, 10), canvasRefs);

    // result
    expect(canvasRefs.vectorLassoPathRef.current).toBeNull();
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual([]);
  });

  it('should do nothing when no node is currently in Vector Edit Mode', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorLassoPathRef.current = [{ x: 0, y: 0 }];

    // before
    continueVectorLassoDrag(canvas, pointerEvent(10, 10), canvasRefs);

    // result — the in-progress path is left untouched, just never extended/tested this tick
    expect(canvasRefs.vectorLassoPathRef.current).toEqual([{ x: 0, y: 0 }]);
  });

  it('should append the new point to the path and select every vertex now enclosed by it', () => {
    // mock — v1(20,20) inside a 0,0 -> 100,100 box the path will trace, v2(500,500) well outside
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.vectorLassoPathRef.current = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];

    // before
    continueVectorLassoDrag(canvas, pointerEvent(0, 100), canvasRefs);

    // result
    expect(canvasRefs.vectorLassoPathRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ]);
    expect(canvasRefs.selectedVectorVertexIdsRef.current).toEqual(['v1']);
  });
});
