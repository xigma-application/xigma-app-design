import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useDrawPolygonTool, TPolygonToolConfig } from './useDrawPolygonTool';

// store
import designReducer, { setActiveTool, setSelection } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDraftEntity } from 'types/design/types';

const CONFIG: TPolygonToolConfig = { fill: '#D9D9D9', name: 'Polygon', sides: 3, tool: ToolName.polygon };

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

describe('useDrawPolygonTool behaviors', () => {
  it('should not react to pointer events when the tool is not active', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderHook(() => useDrawPolygonTool(canvasRef, draftRef, CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 20, 20));

    // result
    expect(draftRef.current).toBeNull();
  });

  it('should update the draft polygon with its side count while dragging', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderHook(() => useDrawPolygonTool(canvasRef, draftRef, CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 40));

    // result
    expect(draftRef.current).toEqual({
      fill: CONFIG.fill,
      height: 30,
      sides: CONFIG.sides,
      type: NodeType.polygon,
      width: 50,
      x: 10,
      y: 10,
    });
  });

  it('should commit a polygon node with the configured fill and sides, then switch back to the default tool', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderHook(() => useDrawPolygonTool(canvasRef, draftRef, CONFIG), {
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

    expect(design.rootOrder).toHaveLength(1);
    expect(design.nodes[design.rootOrder[0]]).toMatchObject({
      fill: CONFIG.fill,
      height: 30,
      name: CONFIG.name,
      sides: CONFIG.sides,
      type: NodeType.polygon,
      width: 50,
      x: 10,
      y: 10,
    });
    expect(design.activeTool).toBe(ToolName.default);
    expect(draftRef.current).toBeNull();
  });

  it('should clear any existing selection once drawing actually starts, not just on tool switch', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setSelection(['existing-node']));
    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderHook(() => useDrawPolygonTool(canvasRef, draftRef, CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // result
    expect(store.getState().design.selectedIds).toEqual(['existing-node']);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderHook(() => useDrawPolygonTool(canvasRef, draftRef, CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10, 1));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 40));

    // result
    expect(draftRef.current).toBeNull();
  });

  it('should add a default-sized node centered on the start point when only one dimension meets the minimum shape size', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderHook(() => useDrawPolygonTool(canvasRef, draftRef, CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 30, 10));
    });

    // result
    const { nodes, rootOrder } = store.getState().design;

    expect(rootOrder).toHaveLength(1);
    expect(nodes[rootOrder[0]]).toMatchObject({ height: 100, width: 100, x: -40, y: -40 });
  });

  it('should add a default-sized node centered on the start point when only the other dimension meets the minimum shape size', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderHook(() => useDrawPolygonTool(canvasRef, draftRef, CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 30));
    });

    // result
    const { nodes, rootOrder } = store.getState().design;

    expect(rootOrder).toHaveLength(1);
    expect(nodes[rootOrder[0]]).toMatchObject({ height: 100, width: 100, x: -40, y: -40 });
  });

  it('should ignore a pointer-up that was not preceded by a pointer-down', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderHook(() => useDrawPolygonTool(canvasRef, draftRef, CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));

    // result
    expect(store.getState().design.activeTool).toBe(CONFIG.tool);
  });

  it('should add a default 100x100 node centered on the click point and switch back to the default tool on a plain click', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderHook(() => useDrawPolygonTool(canvasRef, draftRef, CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));
    });

    // result
    const { design } = store.getState();

    expect(design.rootOrder).toHaveLength(1);
    expect(design.nodes[design.rootOrder[0]]).toMatchObject({ height: 100, width: 100, x: -40, y: -40 });
    expect(design.activeTool).toBe(ToolName.default);
  });
});
