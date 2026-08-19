import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useVectorEditOnDoubleClick } from './useVectorEditOnDoubleClick';

// store
import { addNode, setActiveTool, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return { current: canvas };
};

const doubleClickEvent = (x: number, y: number): MouseEvent => new MouseEvent('dblclick', { clientX: x, clientY: y });

const addTriangleVectorNode = (rotation = 0): string => {
  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      name: 'Vector',
      parentId: null,
      rotation,
      segments: {
        ab: { endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null },
        bc: { endId: 'c', id: 'bc', startId: 'b', tangentEnd: null, tangentStart: null },
        ca: { endId: 'a', id: 'ca', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        a: { id: 'a', x: 2000, y: 2000 },
        b: { id: 'b', x: 2050, y: 2000 },
        c: { id: 'c', x: 2025, y: 2050 },
      },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const renderDoubleClickTool = (canvasRef: RefObject<HTMLCanvasElement | null>): RefObject<string[]> => {
  const refs = createCanvasRefs({ canvasRef });

  renderHook(() => useVectorEditOnDoubleClick(refs), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

  return refs.selectedVectorVertexIdsRef;
};

describe('useVectorEditOnDoubleClick behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should enter Vector Edit Mode and select the node when double-clicked inside its filled region', () => {
    // mock
    const idA = addTriangleVectorNode();
    const canvasRef = createCanvasRef();

    // before
    renderDoubleClickTool(canvasRef);

    // action — inside the triangle
    canvasRef.current?.dispatchEvent(doubleClickEvent(2025, 2020));

    // result
    const { design } = store.getState();

    expect(design.vectorEditingNodeId).toBe(idA);
    expect(design.selectedIds).toEqual([idA]);
  });

  it('should not enter Vector Edit Mode when double-clicking a non-vector node', () => {
    // mock
    addFrameNode(2200, 2200);

    const canvasRef = createCanvasRef();

    // before
    renderDoubleClickTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(doubleClickEvent(2205, 2205));

    // result
    expect(store.getState().design.vectorEditingNodeId).toBeNull();
  });

  it('should not react when the active tool is not the default selection tool', () => {
    // mock
    addTriangleVectorNode();
    store.dispatch(setActiveTool(ToolName.pen));

    const canvasRef = createCanvasRef();

    // before
    renderDoubleClickTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(doubleClickEvent(2025, 2020));

    // result
    expect(store.getState().design.vectorEditingNodeId).toBeNull();
  });

  it('should clear a leftover vertex selection whenever vectorEditingNodeId changes', () => {
    // mock
    const canvasRef = createCanvasRef();
    const selectedVectorVertexIdsRef = renderDoubleClickTool(canvasRef);

    selectedVectorVertexIdsRef.current = ['stale-vertex'];

    // before
    act(() => {
      store.dispatch(setVectorEditingNodeId('some-other-node'));
    });

    // result
    expect(selectedVectorVertexIdsRef.current).toEqual([]);
  });

  it('should exit Vector Edit Mode when double-clicking empty space while already editing', () => {
    // mock
    const idA = addTriangleVectorNode();
    const canvasRef = createCanvasRef();

    act(() => {
      store.dispatch(setVectorEditingNodeId(idA));
    });

    // before
    renderDoubleClickTool(canvasRef);

    // action — nowhere near the triangle
    canvasRef.current?.dispatchEvent(doubleClickEvent(9000, 9000));

    // result
    expect(store.getState().design.vectorEditingNodeId).toBeNull();
  });

  it('should leave a rotated node untouched when merely entering Vector Edit Mode on it — no bake yet', () => {
    // mock — 180deg around the triangle's own bounds-center (2025, 2025) maps each vertex to its
    // point-symmetric opposite, so the double-click must land on the rotated (flipped) triangle; baking
    // is deferred to the first actual interaction (armBakeVectorRotationOnPointerDown.ts), not entry
    const idA = addTriangleVectorNode(180);
    const canvasRef = createCanvasRef();
    const originalNode = store.getState().design.nodes[idA];

    // before
    renderDoubleClickTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(doubleClickEvent(2025, 2030));

    // result
    const { design } = store.getState();

    expect(design.vectorEditingNodeId).toBe(idA);
    expect(design.nodes[idA]).toEqual(originalNode);
  });

  it('should not exit Vector Edit Mode when double-clicking the shape currently being edited', () => {
    // mock
    const idA = addTriangleVectorNode();
    const canvasRef = createCanvasRef();

    act(() => {
      store.dispatch(setVectorEditingNodeId(idA));
    });

    // before
    renderDoubleClickTool(canvasRef);

    // action — inside the triangle it's already editing
    canvasRef.current?.dispatchEvent(doubleClickEvent(2025, 2020));

    // result
    expect(store.getState().design.vectorEditingNodeId).toBe(idA);
  });
});
