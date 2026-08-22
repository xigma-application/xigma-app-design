import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { resolveVectorVertexHover } from '../resolveVectorVertexHover';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createHoveredVectorVertexIdRef = (): RefObject<string | null> => ({ current: null });

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

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('resolveVectorVertexHover', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should do nothing when no node is currently in Vector Edit Mode', () => {
    // mock
    const canvas = createCanvas();
    const hoveredVectorVertexIdRef = createHoveredVectorVertexIdRef();

    // before
    resolveVectorVertexHover(canvas, pointerEvent(0, 0), hoveredVectorVertexIdRef);

    // result
    expect(hoveredVectorVertexIdRef.current).toBeNull();
  });

  it('should set the hovered vertex id when the pointer rests on a vertex', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const hoveredVectorVertexIdRef = createHoveredVectorVertexIdRef();

    // before
    resolveVectorVertexHover(canvas, pointerEvent(0, 0), hoveredVectorVertexIdRef);

    // result
    expect(hoveredVectorVertexIdRef.current).toBe('v1');
  });

  it('should clear the hovered vertex id once the pointer moves away from every vertex', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const hoveredVectorVertexIdRef = createHoveredVectorVertexIdRef();

    // before
    resolveVectorVertexHover(canvas, pointerEvent(0, 0), hoveredVectorVertexIdRef);
    resolveVectorVertexHover(canvas, pointerEvent(50, 50), hoveredVectorVertexIdRef);

    // result
    expect(hoveredVectorVertexIdRef.current).toBeNull();
  });
});
