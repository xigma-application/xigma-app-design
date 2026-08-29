import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useVectorEditOnDoubleClick } from './useVectorEditOnDoubleClick';

// store
import { addNode, setActiveTool, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return { current: canvas };
};

const doubleClickEvent = (x: number, y: number): MouseEvent => new MouseEvent('dblclick', { clientX: x, clientY: y });

const addTriangleVectorNode = (rotation = 0): string => {
  const segments: TVectorNode['segments'] = {
    ab: { endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null },
    bc: { endId: 'c', id: 'bc', startId: 'b', tangentEnd: null, tangentStart: null },
    ca: { endId: 'a', id: 'ca', startId: 'c', tangentEnd: null, tangentStart: null },
  };
  const vertices: TVectorNode['vertices'] = {
    a: { id: 'a', x: 2000, y: 2000 },
    b: { id: 'b', x: 2050, y: 2000 },
    c: { id: 'c', x: 2025, y: 2050 },
  };

  // its interior only counts as a hit once it's actually painted, matching a real drawn-then-filled shape
  const unpaintedNode: TVectorNode = {
    fillColor: '#ff0000',
    filledFaceKeys: [],
    id: 'triangle-face-lookup',
    name: 'Vector',
    parentId: null,
    rotation: 0,
    segments,
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices,
  };
  const [face] = deriveVectorFaces(unpaintedNode);

  store.dispatch(
    addNode({
      fillColor: '#ff0000',
      filledFaceKeys: [getVectorFillLoopKey(face.pieceKeys)],
      name: 'Vector',
      parentId: null,
      rotation,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const renderDoubleClickTool = (canvasRef: RefObject<HTMLCanvasElement | null>): TCanvasRefs => {
  const refs = createCanvasRefs({ canvasRef });

  renderHook(() => useVectorEditOnDoubleClick(refs), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

  return refs;
};

describe('useVectorEditOnDoubleClick behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should enter Vector Edit Mode and select the node when double-clicked inside its filled region', () => {
    // mock
    const idA = addTriangleVectorNode();
    const canvasRef = createCanvasRef();

    // before
    renderDoubleClickTool(canvasRef);

    // action — inside the triangle
    act(() => {
      canvasRef.current?.dispatchEvent(doubleClickEvent(2025, 2020));
    });

    // result
    const { design } = store.getState();

    expect(design.vectorEditingNodeIds).toEqual([idA]);
    expect(design.pages[design.activePageId].selectedIds).toEqual([idA]);
  });

  it('should not enter Vector Edit Mode when double-clicking a non-vector node', () => {
    // mock
    addFrameNode(2200, 2200);

    const canvasRef = createCanvasRef();

    // before
    renderDoubleClickTool(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(doubleClickEvent(2205, 2205));
    });

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
  });

  it('should not react when the active tool is not the default selection tool', () => {
    // mock
    addTriangleVectorNode();
    store.dispatch(setActiveTool(ToolName.pen));

    const canvasRef = createCanvasRef();

    // before
    renderDoubleClickTool(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(doubleClickEvent(2025, 2020));
    });

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
  });

  it('should clear a leftover vertex selection and tangent handle selection whenever vectorEditingNodeIds changes', () => {
    // mock
    const canvasRef = createCanvasRef();
    const refs = renderDoubleClickTool(canvasRef);

    refs.vectorEdit.selectedVectorVertexIdsRef.current = ['stale-vertex'];
    refs.vectorEdit.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];

    // before
    act(() => {
      store.dispatch(setVectorEditingNodeIds(['some-other-node']));
    });

    // result
    expect(refs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(refs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
  });

  it('should exit Vector Edit Mode when double-clicking empty space while already editing', () => {
    // mock
    const idA = addTriangleVectorNode();
    const canvasRef = createCanvasRef();

    act(() => {
      store.dispatch(setVectorEditingNodeIds([idA]));
    });

    // before
    renderDoubleClickTool(canvasRef);

    // action — nowhere near the triangle
    act(() => {
      canvasRef.current?.dispatchEvent(doubleClickEvent(9000, 9000));
    });

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
  });

  it('should leave a rotated node untouched when merely entering Vector Edit Mode on it — no bake yet', () => {
    // mock — 180deg around the triangle's own bounds-center (2025, 2025) maps each vertex to its
    // point-symmetric opposite, so the double-click must land on the rotated (flipped) triangle; baking
    // is deferred to the first actual interaction (armBakeVectorRotationOnPointerDown.ts), not entry
    const idA = addTriangleVectorNode(180);
    const canvasRef = createCanvasRef();
    const originalNode = store.getState().design.pages[store.getState().design.activePageId].nodes[idA];

    // before
    renderDoubleClickTool(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(doubleClickEvent(2025, 2030));
    });

    // result
    const { design } = store.getState();
    const page = design.pages[design.activePageId];

    expect(design.vectorEditingNodeIds).toEqual([idA]);
    expect(page.nodes[idA]).toEqual(originalNode);
  });

  it('should not exit Vector Edit Mode when double-clicking the shape currently being edited', () => {
    // mock
    const idA = addTriangleVectorNode();
    const canvasRef = createCanvasRef();

    act(() => {
      store.dispatch(setVectorEditingNodeIds([idA]));
    });

    // before
    renderDoubleClickTool(canvasRef);

    // action — inside the triangle it's already editing
    act(() => {
      canvasRef.current?.dispatchEvent(doubleClickEvent(2025, 2020));
    });

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([idA]);
  });
});
