// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveVectorTangentHandleHover } from '../resolveVectorTangentHandleHover';

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
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('resolveVectorTangentHandleHover', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should do nothing when no node is currently in Vector Edit Mode', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    resolveVectorTangentHandleHover(canvas, pointerEvent(5, 0), canvasRefs);

    // result
    expect(canvasRefs.hoveredVectorHandleRef.current).toBeNull();
  });

  it('should set the hovered handle when the pointer rests on a tangent handle whose parent vertex is selected', () => {
    // mock — s1's start handle sits at v1(0,0) + tangentStart(5,0) = (5,0); v1 must be selected for it to be visible/hittable
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    resolveVectorTangentHandleHover(canvas, pointerEvent(5, 0), canvasRefs);

    // result
    expect(canvasRefs.hoveredVectorHandleRef.current).toEqual({ end: 'start', segmentId: 's1' });
  });

  it('should not set the hovered handle when its parent vertex is not selected and it is not itself selected', () => {
    // mock — same handle, but nothing is selected, so it is neither visible nor hittable
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    resolveVectorTangentHandleHover(canvas, pointerEvent(5, 0), canvasRefs);

    // result
    expect(canvasRefs.hoveredVectorHandleRef.current).toBeNull();
  });

  it('should set the hovered handle when its parent vertex is only the Pen tool’s still-active vertex', () => {
    // mock — v1 is penActiveVertexId, not part of selectedVectorVertexIdsRef, and must still make its own handle hittable
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPenActiveVertexId('v1'));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    resolveVectorTangentHandleHover(canvas, pointerEvent(5, 0), canvasRefs);

    // result
    expect(canvasRefs.hoveredVectorHandleRef.current).toEqual({ end: 'start', segmentId: 's1' });
  });

  it('should clear the hovered handle once the pointer moves away from every handle', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    resolveVectorTangentHandleHover(canvas, pointerEvent(5, 0), canvasRefs);
    resolveVectorTangentHandleHover(canvas, pointerEvent(50, 50), canvasRefs);

    // result
    expect(canvasRefs.hoveredVectorHandleRef.current).toBeNull();
  });
});
