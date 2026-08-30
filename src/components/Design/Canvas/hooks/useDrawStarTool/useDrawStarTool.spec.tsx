import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useDrawStarTool, TStarToolConfig } from './useDrawStarTool';

// store
import designReducer, { addNode, setActiveTool, setSelection } from 'store/design/slice';
import { TDesignState } from 'store/design/types';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDraftEntity } from 'types/design/types';

const CONFIG: TStarToolConfig = { fill: '#D9D9D9', name: 'Star', points: 5, ratio: 0.382, tool: ToolName.star };

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

describe('useDrawStarTool behaviors', () => {
  it('should not react to pointer events when the tool is not active', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderHook(() => useDrawStarTool(createCanvasRefs({ canvasRef, draftRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 20, 20));

    // result
    expect(draftRef.current).toBeNull();
  });

  it('should update the draft star with its points and ratio while dragging', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderHook(() => useDrawStarTool(createCanvasRefs({ canvasRef, draftRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 40));

    // result
    expect(draftRef.current).toEqual({
      fill: CONFIG.fill,
      height: 30,
      points: CONFIG.points,
      ratio: CONFIG.ratio,
      type: NodeType.star,
      width: 50,
      x: 10,
      y: 10,
    });
  });

  it('should commit a star node with the configured fill, points and ratio, then switch back to the default tool', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderHook(() => useDrawStarTool(createCanvasRefs({ canvasRef, draftRef }), CONFIG), {
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
    expect(page.nodes[page.rootOrder[0]]).toMatchObject({
      fill: CONFIG.fill,
      height: 30,
      name: CONFIG.name,
      points: CONFIG.points,
      ratio: CONFIG.ratio,
      type: NodeType.star,
      width: 50,
      x: 10,
      y: 10,
    });
    expect(design.activeTool).toBe(ToolName.default);
    expect(page.selectedIds).toEqual([page.rootOrder[0]]);
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
    renderHook(() => useDrawStarTool(createCanvasRefs({ canvasRef, draftRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // result
    expect(selectSelectedIds(store.getState())).toEqual(['existing-node']);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([]);
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };

    // before
    renderHook(() => useDrawStarTool(createCanvasRefs({ canvasRef, draftRef }), CONFIG), {
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
    renderHook(() => useDrawStarTool(createCanvasRefs({ canvasRef, draftRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 30, 10));
    });

    // result
    const { nodes, rootOrder } = selectActivePage(store.getState());

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
    renderHook(() => useDrawStarTool(createCanvasRefs({ canvasRef, draftRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 30));
    });

    // result
    const { nodes, rootOrder } = selectActivePage(store.getState());

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
    renderHook(() => useDrawStarTool(createCanvasRefs({ canvasRef, draftRef }), CONFIG), {
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
    renderHook(() => useDrawStarTool(createCanvasRefs({ canvasRef, draftRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));
    });

    // result
    const { design } = store.getState();
    const page = design.pages[design.activePageId];

    expect(page.rootOrder).toHaveLength(1);
    expect(page.nodes[page.rootOrder[0]]).toMatchObject({ height: 100, width: 100, x: -40, y: -40 });
    expect(design.activeTool).toBe(ToolName.default);
    expect(page.selectedIds).toEqual([page.rootOrder[0]]);
  });
});

describe('useDrawStarTool alignment snap', () => {
  it('should snap the drafted star onto a nearby existing shape while dragging, populating the alignment guide', () => {
    // mock — a candidate rect whose left edge (63) sits 3px past the raw drag endpoint (60), within tolerance
    const store = createTestStore();

    store.dispatch(
      addNode({
        fill: '#000000',
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
    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const refs = createCanvasRefs({ canvasRef, draftRef });

    // before
    renderHook(() => useDrawStarTool(refs, CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 40));

    // result — corrected so the right edge lands flush at 63 (width 53), and the guide is populated
    expect(draftRef.current).toMatchObject({ width: 53, x: 10 });
    expect(refs.transform.alignmentGuideRef.current).not.toBeNull();
  });

  it('should commit the snapped size and clear the alignment guide on pointer up', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      addNode({
        fill: '#000000',
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
    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const draftRef: RefObject<TDraftEntity | null> = { current: null };
    const refs = createCanvasRefs({ canvasRef, draftRef });

    // before
    renderHook(() => useDrawStarTool(refs, CONFIG), {
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
    const created = page.nodes[page.rootOrder[page.rootOrder.length - 1]];

    expect(created).toMatchObject({ width: 53, x: 10 });
    expect(refs.transform.alignmentGuideRef.current).toBeNull();
  });
});
