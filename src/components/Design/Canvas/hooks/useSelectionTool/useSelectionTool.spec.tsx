import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// core
import ClassNamesProvider from 'components/Design/core/ClassNamesProvider/ClassNamesProvider';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useSelectionTool } from './useSelectionTool';

// store
import { addNode, setActiveTool, setSelection, setVectorEditingNodeIds, startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDraftRect, TEditingTextBox } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  // jsdom doesn't implement pointer capture on elements
  canvas.setPointerCapture = vi.fn();
  canvas.releasePointerCapture = vi.fn();

  return { current: canvas };
};

const pointerEvent = (type: string, x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent(type, { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: size,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addLineNode = (x1: number, y1: number, x2: number, y2: number): string => {
  store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

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
      vertices: { v1: { id: 'v1', x: 3400, y: 700 }, v2: { id: 'v2', x: 3500, y: 700 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

// same v1(3400,700)/v2(3500,700) layout, but s1 already carries a real tangentStart (a handle at
// v1 + (50,0) = (3450,700)) so there's an existing, grabbable handle to drag in Vector Edit Mode
const addVectorNodeWithTangent = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 50, y: 0 } } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 3400, y: 700 }, v2: { id: 'v2', x: 3500, y: 700 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

// a closed triangle, unlike addVectorNode/addVectorNodeWithTangent's open line — Shape Builder
// hover hit-testing needs a real bounded face to land on
const addTriangleVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: '#000000',
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
      vertices: { v1: { id: 'v1', x: 3400, y: 700 }, v2: { id: 'v2', x: 3500, y: 700 }, v3: { id: 'v3', x: 3450, y: 800 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const renderSelectionTool = (canvasRef: RefObject<HTMLCanvasElement | null>): RefObject<TDraftRect | null> => {
  const refs = createCanvasRefs({ canvasRef });

  renderHook(() => useSelectionTool(refs), {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <ClassNamesProvider>{children}</ClassNamesProvider>
      </Provider>
    ),
  });

  return refs.marqueeRef;
};

describe('useSelectionTool behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setSelection([]));
    store.dispatch(stopTextEdit());
    store.dispatch(setVectorEditingNodeIds([]));

    // drag dispatches are throttled to one per animation frame — run the callback immediately so these
    // pointer-event-driven tests can assert on the store synchronously, same as before the throttle existed
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback): number => {
      callback(0);

      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should not react to pointer events when the default tool is not active', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.frame));

    const idA = addFrameNode(0, 0);
    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
    expect(idA).toBeTruthy();
  });

  it('should select an unselected node on a plain click', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 110, 110));

    // result
    expect(store.getState().design.selectedIds).toEqual([idA]);
  });

  it('should deselect everything when clicking empty canvas', () => {
    // mock
    const idA = addFrameNode(200, 200);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 900, 900));

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
  });

  it('should not change the selection when shift-clicking empty canvas', () => {
    // mock
    const idA = addFrameNode(210, 210);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 950, 950, { shiftKey: true }));

    // result
    expect(store.getState().design.selectedIds).toEqual([idA]);
  });

  it('should add an unselected node to the selection on shift-click', () => {
    // mock
    const idA = addFrameNode(300, 300);
    const idB = addFrameNode(340, 300);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 345, 305, { shiftKey: true }));

    // result
    expect(store.getState().design.selectedIds).toEqual([idA, idB]);
  });

  it('should remove an already-selected node on shift-click', () => {
    // mock
    const idA = addFrameNode(400, 400);
    const idB = addFrameNode(440, 400);

    store.dispatch(setSelection([idA, idB]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 405, 405, { shiftKey: true }));

    // result
    expect(store.getState().design.selectedIds).toEqual([idB]);
  });

  it('should replace the selection when plain-clicking a node that was never selected', () => {
    // mock
    const idA = addFrameNode(500, 500);
    const idB = addFrameNode(540, 500);
    const idC = addFrameNode(580, 500);

    store.dispatch(setSelection([idA, idB]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 585, 505));

    // result
    expect(store.getState().design.selectedIds).toEqual([idC]);
  });

  it('should collapse a multi-selection to the clicked node when released without moving', () => {
    // mock
    const idA = addFrameNode(600, 600);
    const idB = addFrameNode(640, 600);

    store.dispatch(setSelection([idA, idB]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 605, 605));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 605, 605));

    // result
    expect(store.getState().design.selectedIds).toEqual([idA]);
  });

  it('should keep the multi-selection and move every node together when dragged', () => {
    // mock
    const idA = addFrameNode(700, 700);
    const idB = addFrameNode(740, 700);

    store.dispatch(setSelection([idA, idB]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 705, 705));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 715, 715));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 715, 715));

    // result
    const { nodes, selectedIds } = store.getState().design;

    expect(selectedIds).toEqual([idA, idB]);
    expect(nodes[idA]).toMatchObject({ x: 710, y: 710 });
    expect(nodes[idB]).toMatchObject({ x: 750, y: 710 });
  });

  it('should move every node together when dragging from the gap inside the shared selection bounds', () => {
    // mock
    const idA = addFrameNode(1100, 700, 20);
    const idB = addFrameNode(1160, 700, 20);

    store.dispatch(setSelection([idA, idB]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action - click in the gap between the two nodes (1140,710 is inside neither node)
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 1140, 710));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 1150, 720));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 1150, 720));

    // result
    const { nodes, selectedIds } = store.getState().design;

    expect(selectedIds).toEqual([idA, idB]);
    expect(nodes[idA]).toMatchObject({ x: 1110, y: 710 });
    expect(nodes[idB]).toMatchObject({ x: 1170, y: 710 });
  });

  it('should deselect everything when clicking the gap without moving', () => {
    // mock
    const idA = addFrameNode(1200, 700, 20);
    const idB = addFrameNode(1260, 700, 20);

    store.dispatch(setSelection([idA, idB]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 1240, 710));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 1240, 710));

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
  });

  it('should select an unselected node sitting in the gap instead of deselecting everything', () => {
    // mock
    const idA = addFrameNode(1400, 700, 20);
    const idC = addFrameNode(1430, 700, 20);
    const idB = addFrameNode(1460, 700, 20);

    store.dispatch(setSelection([idA, idB]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action - click directly on the unselected node C, which sits inside A+B's shared bounds
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 1440, 710));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 1440, 710));

    // result
    expect(store.getState().design.selectedIds).toEqual([idC]);
  });

  it('should not replace the selection while the button is still pressed on an unselected node in the gap', () => {
    // mock
    const idA = addFrameNode(1500, 700, 20);
    addFrameNode(1530, 700, 20);
    const idB = addFrameNode(1560, 700, 20);

    store.dispatch(setSelection([idA, idB]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action - press down on the unselected node in the gap, but do not release
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 1540, 710));

    // result - selection must stay untouched until pointerup decides
    expect(store.getState().design.selectedIds).toEqual([idA, idB]);
  });

  it('should move the whole group together when dragging from an unselected node in the gap', () => {
    // mock
    const idA = addFrameNode(1600, 700, 20);
    const idC = addFrameNode(1630, 700, 20);
    const idB = addFrameNode(1660, 700, 20);

    store.dispatch(setSelection([idA, idB]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 1640, 710));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 1650, 720));

    // result - A and B (the actual selection) move together; C (the hit node) is untouched and unselected
    const { nodes, selectedIds } = store.getState().design;

    expect(selectedIds).toEqual([idA, idB]);
    expect(nodes[idA]).toMatchObject({ x: 1610, y: 710 });
    expect(nodes[idB]).toMatchObject({ x: 1670, y: 710 });
    expect(nodes[idC]).toMatchObject({ x: 1630, y: 700 });
  });

  it('should deselect everything when clicking outside the shared selection bounds', () => {
    // mock
    const idA = addFrameNode(1300, 700, 20);
    const idB = addFrameNode(1360, 700, 20);

    store.dispatch(setSelection([idA, idB]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 1900, 1900));

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
  });

  it('should move a single selected node while dragging', () => {
    // mock
    const idA = addFrameNode(800, 800);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 805, 805));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 825, 815));

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ x: 820, y: 810 });
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const idA = addFrameNode(900, 900);
    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 905, 905, { button: 1 }));

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
    expect(idA).toBeTruthy();
  });

  it('should ignore pointer-move while no drag is armed', () => {
    // mock
    const idA = addFrameNode(1000, 1000);
    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    expect(() => canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 1005, 1005))).not.toThrow();

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ x: 1000, y: 1000 });
  });

  it('should ignore a pointer-up that was not preceded by a pointer-down', () => {
    // mock
    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    expect(() => canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10))).not.toThrow();

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
  });

  it('should select every node the marquee touches while dragging, and clear the marquee on release', () => {
    // mock
    const idP = addFrameNode(2000, 700, 20); // fully inside the marquee
    const idQ = addFrameNode(2050, 700, 20); // only partially overlapped by the marquee

    const canvasRef = createCanvasRef();

    // before
    const marqueeRef = renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 1990, 690));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2060, 730));

    // result
    expect(store.getState().design.selectedIds).toEqual([idP, idQ]);
    expect(marqueeRef.current).toEqual({ height: 40, width: 70, x: 1990, y: 690 });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 2060, 730));

    // result
    expect(marqueeRef.current).toBeNull();
  });

  it('should only select fully-contained nodes when Control is held during the marquee drag', () => {
    // mock
    const idP = addFrameNode(2100, 700, 20); // fully inside the marquee
    addFrameNode(2150, 700, 20); // Q, only partially overlapped — must stay unselected under Control

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 2090, 690, { ctrlKey: true }));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2160, 730, { ctrlKey: true }));

    // result
    expect(store.getState().design.selectedIds).toEqual([idP]);
  });

  it('should move both endpoints together when dragging the body of a selected line', () => {
    // mock
    const idA = addLineNode(2200, 700, 2300, 700);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action - grab the middle of the segment, well away from either endpoint handle
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 2250, 700));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2260, 710));

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ x1: 2210, x2: 2310, y1: 710, y2: 710 });
  });

  it('should move only endpoint A when dragging its handle, leaving endpoint B in place', () => {
    // mock
    const idA = addLineNode(2400, 700, 2500, 700);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action - grab endpoint A's handle
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 2400, 700));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2420, 760));

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ x1: 2420, x2: 2500, y1: 760, y2: 700 });
  });

  it('should move only endpoint B when dragging its handle, leaving endpoint A in place', () => {
    // mock
    const idA = addLineNode(2600, 700, 2700, 700);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action - grab endpoint B's handle
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 2700, 700));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2720, 760));

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ x1: 2600, x2: 2720, y1: 700, y2: 760 });
  });

  it('should release the pointer and stop applying further moves once an endpoint drag is released', () => {
    // mock
    const idA = addLineNode(2800, 700, 2900, 700);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 2800, 700)); // endpoint A
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2820, 760));
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 2820, 760));

    // result
    expect(canvasRef.current?.releasePointerCapture).toHaveBeenCalledWith(1);

    // action - further moves after release must not keep dragging the endpoint
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2900, 900));

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ x1: 2820, x2: 2900, y1: 760, y2: 700 });
  });

  it('should clear the hovered vector vertex id when the pointer leaves the canvas', () => {
    // mock
    const canvasRef = createCanvasRef();
    const refs = createCanvasRefs({ canvasRef });

    refs.hoveredVectorVertexIdRef.current = 'v1';

    // before
    renderHook(() => useSelectionTool(refs), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ClassNamesProvider>{children}</ClassNamesProvider>
        </Provider>
      ),
    });

    // action
    canvasRef.current?.dispatchEvent(new PointerEvent('pointerleave'));

    // result
    expect(refs.hoveredVectorVertexIdRef.current).toBeNull();
  });

  it('should clear the hovered vector segment id when the pointer leaves the canvas', () => {
    // mock
    const canvasRef = createCanvasRef();
    const refs = createCanvasRefs({ canvasRef });

    refs.hoveredVectorSegmentIdRef.current = 's1';

    // before
    renderHook(() => useSelectionTool(refs), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ClassNamesProvider>{children}</ClassNamesProvider>
        </Provider>
      ),
    });

    // action
    canvasRef.current?.dispatchEvent(new PointerEvent('pointerleave'));

    // result
    expect(refs.hoveredVectorSegmentIdRef.current).toBeNull();
  });

  it('should clear the selected vector vertex and tangent handle once the tool leaves Move/Scale, instead of leaving a stale "selected" dot behind — e.g. switching back to Pen', () => {
    // mock
    const canvasRef = createCanvasRef();
    const refs = createCanvasRefs({ canvasRef });

    refs.selectedVectorVertexIdsRef.current = ['v1'];
    refs.selectedVectorHandlesRef.current = [{ end: 'start', segmentId: 's1' }];
    refs.snappedVectorHandleRef.current = { end: 'start', segmentId: 's1' };

    // before
    renderHook(() => useSelectionTool(refs), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ClassNamesProvider>{children}</ClassNamesProvider>
        </Provider>
      ),
    });

    // action
    act(() => {
      store.dispatch(setActiveTool(ToolName.pen));
    });

    // result
    expect(refs.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(refs.selectedVectorHandlesRef.current).toEqual([]);
    expect(refs.snappedVectorHandleRef.current).toBeNull();
  });

  it('should re-evaluate an in-progress tangent-handle drag immediately when Shift is pressed, without a further pointermove', () => {
    // mock — s1's real tangentStart handle sits at v1(3400,700) + (50,0) = (3450,700)
    const nodeId = addVectorNodeWithTangent();
    const canvasRef = createCanvasRef();
    const refs = createCanvasRefs({ canvasRef });

    refs.selectedVectorVertexIdsRef.current = ['v1']; // reveals v1's own handle for hit-testing
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    renderHook(() => useSelectionTool(refs), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ClassNamesProvider>{children}</ClassNamesProvider>
        </Provider>
      ),
    });

    // press exactly on the handle, then drag it to an off-cardinal diagonal position (dx=20,dy=12,
    // ~31deg from v1) — an unsnapped in-progress drag
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 3450, 700));
    });
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 3420, 712));
    });

    expect(refs.snappedVectorHandleRef.current).toBeNull();

    // action — Shift held, no further pointer movement
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
    });

    // result — hard-constrained at the same live position, no additional mouse movement needed
    expect(refs.snappedVectorHandleRef.current).toEqual({ end: 'start', segmentId: 's1' });

    // action — Shift released, still no further pointer movement
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', shiftKey: false }));
    });

    // result — back to the plain unsnapped drag at the same diagonal position
    expect(refs.snappedVectorHandleRef.current).toBeNull();
  });

  it('should not react to Shift while no tangent-handle drag is in progress', () => {
    // mock
    const nodeId = addVectorNodeWithTangent();
    const canvasRef = createCanvasRef();
    const refs = createCanvasRefs({ canvasRef });

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    renderHook(() => useSelectionTool(refs), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ClassNamesProvider>{children}</ClassNamesProvider>
        </Provider>
      ),
    });

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 3420, 712));
    });

    // action — Shift held, but nothing is being dragged
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
    });

    // result
    expect(refs.snappedVectorHandleRef.current).toBeNull();
  });

  it('should re-evaluate the Shape Builder hover immediately when Alt is pressed, without a further pointermove', () => {
    // mock — triangle spans x:3400-3500, y:700-800; hover the interior at (3450,750)
    const nodeId = addTriangleVectorNode();
    const canvasRef = createCanvasRef();
    const refs = createCanvasRefs({ canvasRef });

    store.dispatch(setActiveTool(ToolName.shapeBuilder));
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    renderHook(() => useSelectionTool(refs), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ClassNamesProvider>{children}</ClassNamesProvider>
        </Provider>
      ),
    });

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 3450, 750));
    });

    expect(refs.isVectorShapeBuilderSubtractRef.current).toBe(false);

    // action — Alt held, no further pointer movement
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { altKey: true, key: 'Alt' }));
    });

    // result — subtract mode flips on at the same live hover position
    expect(refs.isVectorShapeBuilderSubtractRef.current).toBe(true);
    expect(refs.hoveredVectorShapeBuilderFaceRef.current).toEqual({ faceKey: 's1,s2,s3', nodeId });

    // action — Alt released, still no further pointer movement
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { altKey: false, key: 'Alt' }));
    });

    // result — back to add mode at the same hover position
    expect(refs.isVectorShapeBuilderSubtractRef.current).toBe(false);
  });

  it('should not react to Alt while Shape Builder is not the active tool', () => {
    // mock
    const nodeId = addTriangleVectorNode();
    const canvasRef = createCanvasRef();
    const refs = createCanvasRefs({ canvasRef });

    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    renderHook(() => useSelectionTool(refs), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ClassNamesProvider>{children}</ClassNamesProvider>
        </Provider>
      ),
    });

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 3450, 750));
    });

    // action — Alt held, but Shape Builder isn't active
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { altKey: true, key: 'Alt' }));
    });

    // result
    expect(refs.isVectorShapeBuilderSubtractRef.current).toBe(false);
  });

  it('should not react to pointer events while a path-text node is being edited', () => {
    // mock
    const idA = addFrameNode(3000, 700);
    const box: TEditingTextBox = { flipX: false, flipY: false, height: 20, pathId: 'ellipse-1', rotation: 0, width: 20, x: 3000, y: 700 };

    store.dispatch(startTextEdit({ box, content: 'Hi' }));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 3005, 705));

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
    expect(idA).toBeTruthy();
  });

  it('should resume reacting to pointer events once path-text editing ends', () => {
    // mock
    const idA = addFrameNode(3100, 700);
    const box: TEditingTextBox = { flipX: false, flipY: false, height: 20, pathId: 'ellipse-1', rotation: 0, width: 20, x: 3100, y: 700 };

    store.dispatch(startTextEdit({ box, content: 'Hi' }));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);
    act(() => store.dispatch(stopTextEdit()));

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 3105, 705));

    // result
    expect(store.getState().design.selectedIds).toEqual([idA]);
  });

  it('should not react to pointer events while a plain (unrotated, unflipped) straight-text node is being edited, since the overlay itself is pointer-events: none and every click falls through to the canvas', () => {
    // mock
    const idA = addFrameNode(3150, 700);
    const box: TEditingTextBox = { flipX: false, flipY: false, height: 20, rotation: 0, width: 20, x: 3150, y: 700 };

    store.dispatch(startTextEdit({ box, content: 'Hi' }));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 3155, 705));

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
    expect(idA).toBeTruthy();
  });

  it('should not react to pointer events while a rotated straight-text node is being edited', () => {
    // mock
    const idA = addFrameNode(3200, 700);
    const box: TEditingTextBox = { flipX: false, flipY: false, height: 20, rotation: 180, width: 20, x: 3200, y: 700 };

    store.dispatch(startTextEdit({ box, content: 'Hi' }));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 3205, 705));

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
    expect(idA).toBeTruthy();
  });

  it('should bend a segment on Ctrl+drag, and revert it back to its pre-drag tangents on Escape mid-drag', () => {
    // mock — v1(3400,700)-v2(3500,700), plain straight segment
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action — Ctrl+mousedown reveals straight-line default tangents, then dragging bends the segment
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 3450, 700, { ctrlKey: true }));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 3450, 760, { ctrlKey: true }));
    });

    // result — the drag actually changed the tangents away from the straight-line defaults it started at
    const bentNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(bentNode.segments.s1.tangentStart).not.toEqual({ x: 100 / 3, y: 0 });
    expect(bentNode.segments.s1.tangentEnd).not.toEqual({ x: -100 / 3, y: 0 });

    // action — Escape mid-drag (button still conceptually held) cancels it
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    // result — back to null, the segment's state from before the Ctrl+click ever happened
    const revertedNode = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(revertedNode.segments.s1.tangentStart).toBeNull();
    expect(revertedNode.segments.s1.tangentEnd).toBeNull();

    // action — further pointer movement no longer bends anything, since Escape cleared the drag
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 3450, 900, { ctrlKey: true }));
    });

    // result
    const afterFurtherMove = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(afterFurtherMove.segments.s1.tangentStart).toBeNull();
    expect(afterFurtherMove.segments.s1.tangentEnd).toBeNull();
  });

  it('should not react to pointer events while a flipped straight-text node is being edited', () => {
    // mock
    const idA = addFrameNode(3300, 700);
    const box: TEditingTextBox = { flipX: true, flipY: false, height: 20, rotation: 0, width: 20, x: 3300, y: 700 };

    store.dispatch(startTextEdit({ box, content: 'Hi' }));

    const canvasRef = createCanvasRef();

    // before
    renderSelectionTool(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 3305, 705));

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
    expect(idA).toBeTruthy();
  });

  it('should add a width point when Variable Width is active and the pointer is pressed then released on the stroke', () => {
    // mock — v1(3400,700)->v2(3500,700), pressed/released at the segment's own midpoint
    const nodeId = addVectorNode();
    const canvasRef = createCanvasRef();
    const refs = createCanvasRefs({ canvasRef });

    store.dispatch(setActiveTool(ToolName.variableWidth));
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    renderHook(() => useSelectionTool(refs), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ClassNamesProvider>{children}</ClassNamesProvider>
        </Provider>
      ),
    });

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 3450, 700));
    });

    // result — a width point was armed for a drag on this node's stroke
    expect(refs.vectorWidthPointDragRef.current).toMatchObject({ isNewPoint: true, nodeId });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 3450, 700));
    });

    // result — committed to the store and the drag ref cleared
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.widthProfile?.points).toMatchObject({ [Object.keys(node.widthProfile?.points ?? {})[0]]: { position: 0.5 } });
    expect(refs.vectorWidthPointDragRef.current).toBeNull();
  });
});
