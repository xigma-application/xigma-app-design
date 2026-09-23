import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useDrawTextTool } from './useDrawTextTool';

// store
import designReducer, { addNode, setActiveTool, setSelection } from 'store/design/slice';
import { TDesignState } from 'store/design/types';
import { selectActivePage, selectEditingNodeId, selectEditingTextBox, selectSelectedIds } from 'store/design/selectors';

// types
import { NodeType, ToolName } from 'types/design/enums';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  // jsdom doesn't implement pointer capture on elements
  canvas.setPointerCapture = vi.fn();
  canvas.releasePointerCapture = vi.fn();

  return { current: canvas };
};

const pointerEvent = (type: string, x: number, y: number, button = 0): PointerEvent =>
  new PointerEvent(type, { button, clientX: x, clientY: y, pointerId: 1 });

describe('useDrawTextTool behaviors', () => {
  it('should not react to pointer events when the tool is not active', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawTextTool(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 20, 20));

    // result
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(0);
  });

  it('should create an empty text node immediately at pointer-down and resize it live while dragging', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(ToolName.text));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawTextTool(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));

    const page = selectActivePage(store.getState());

    expect(page.rootOrder).toHaveLength(1);
    expect(page.selectedIds).toEqual([page.rootOrder[0]]);

    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 40));

    // result
    expect(selectActivePage(store.getState()).nodes[page.rootOrder[0]]).toMatchObject({
      content: '',
      height: 30,
      type: NodeType.text,
      width: 50,
      x: 10,
      y: 10,
    });
  });

  it('should start text editing on the already-created node and switch back to the default tool on pointer up', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(ToolName.text));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawTextTool(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 40));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 60, 40));
    });

    // result
    const { design } = store.getState();
    const page = design.pages[design.activePageId];

    expect(page.rootOrder).toHaveLength(1);
    expect(page.nodes[page.rootOrder[0]]).toMatchObject({ content: '', height: 30, type: NodeType.text, width: 50, x: 10, y: 10 });
    expect(selectEditingNodeId(store.getState())).toBe(page.rootOrder[0]);
    expect(selectEditingTextBox(store.getState())).toEqual({
      flipX: false,
      flipY: false,
      height: 30,
      rotation: 0,
      width: 50,
      x: 10,
      y: 10,
    });
    expect(design.activeTool).toBe(ToolName.default);
  });

  it('should select the newly created text node immediately at pointer-down, replacing any existing selection', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setSelection(['existing-node']));
    store.dispatch(setActiveTool(ToolName.text));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawTextTool(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // result
    expect(selectSelectedIds(store.getState())).toEqual(['existing-node']);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));

    // result
    const page = selectActivePage(store.getState());

    expect(selectSelectedIds(store.getState())).toEqual([page.rootOrder[0]]);
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(ToolName.text));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawTextTool(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10, 1));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 40));

    // result
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(0);
  });

  it('should start text editing with a default-sized, top-left-anchored box when only one dimension meets the minimum shape size', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(ToolName.text));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawTextTool(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 30, 10));
    });

    // result
    expect(selectEditingTextBox(store.getState())).toMatchObject({ height: 100, width: 100, x: 10, y: 10 });
  });

  it('should start text editing with a default-sized, top-left-anchored box when only the other dimension meets the minimum shape size', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(ToolName.text));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawTextTool(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 30));
    });

    // result
    expect(selectEditingTextBox(store.getState())).toMatchObject({ height: 100, width: 100, x: 10, y: 10 });
  });

  it('should ignore a pointer-up that was not preceded by a pointer-down', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(ToolName.text));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawTextTool(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.text);
  });

  it('should start text editing with a default 100x100, top-left-anchored box on a plain click', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(ToolName.text));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawTextTool(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));
    });

    // result
    const { design } = store.getState();

    expect(selectEditingTextBox(store.getState())).toMatchObject({ height: 100, width: 100, x: 10, y: 10 });
    expect(design.activeTool).toBe(ToolName.default);
  });

  it('should parent the new text node into the frame under the cursor', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fills: [],
        height: 400,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 400,
        x: 0,
        y: 0,
      }),
    );
    store.dispatch(setActiveTool(ToolName.text));

    const canvasRef = createCanvasRef();
    const frameId = selectActivePage(store.getState()).rootOrder.at(-1) as string;

    // before
    renderHook(() => useDrawTextTool(createCanvasRefs({ canvasRef })), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 50, 60));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 50, 60));
    });

    // result
    const page = selectActivePage(store.getState());
    const textId = selectEditingNodeId(store.getState()) as string;

    expect(page.nodes[textId].parentId).toBe(frameId);
    expect((page.nodes[frameId] as { childIds: string[] }).childIds).toContain(textId);
  });

  it('should delete the in-progress text node and reset the tool when Escape is pressed mid-drag', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(ToolName.text));

    const canvasRef = createCanvasRef();
    const refs = createCanvasRefs({ canvasRef });

    // before
    renderHook(() => useDrawTextTool(refs), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 40));
      refs.drawing.cancelDrawRef.current?.();
    });

    // result
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(0);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });
});

describe('useDrawTextTool alignment snap', () => {
  it('should snap the in-progress text box onto a nearby existing shape while dragging, populating the alignment guide', () => {
    // mock — a candidate rect whose left edge (63) sits 3px past the raw drag endpoint (60), within tolerance
    const store = createTestStore();

    store.dispatch(
      addNode({
        fills: [{ color: '#000000', opacity: 100, type: 'solid' }],
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 63,
        y: 0,
      }),
    );
    store.dispatch(setActiveTool(ToolName.text));

    const canvasRef = createCanvasRef();
    const refs = createCanvasRefs({ canvasRef });

    // before
    renderHook(() => useDrawTextTool(refs), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));

    const nodeId = selectActivePage(store.getState()).rootOrder.at(-1) as string;

    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 40));

    // result — corrected so the right edge lands flush at 63 (width 53), and the guide is populated
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({ width: 53, x: 10 });
    expect(refs.transform.alignmentGuideRef.current).not.toBeNull();
  });

  it('should commit the snapped box and clear the alignment guide on pointer up', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      addNode({
        fills: [{ color: '#000000', opacity: 100, type: 'solid' }],
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 63,
        y: 0,
      }),
    );
    store.dispatch(setActiveTool(ToolName.text));

    const canvasRef = createCanvasRef();
    const refs = createCanvasRefs({ canvasRef });

    // before
    renderHook(() => useDrawTextTool(refs), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 40));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 60, 40));
    });

    // result
    expect(selectEditingTextBox(store.getState())).toMatchObject({ width: 53, x: 10 });
    expect(refs.transform.alignmentGuideRef.current).toBeNull();
  });
});
