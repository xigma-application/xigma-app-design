// types
import { TLineNode } from 'types/design/types';

// utils
import { getLinePoints } from 'utils/canvas/line/getLinePoints';
import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useDrawLineTool, TLineToolConfig } from './useDrawLineTool';

// store
import designReducer, { setActiveTool, setSelection } from 'store/design/slice';
import { TDesignState } from 'store/design/types';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';

// types
import { LineEndpoint, NodeType, ToolName } from 'types/design/enums';

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

const CONFIG: TLineToolConfig = {
  endPoint: LineEndpoint.none,
  name: 'Line',
  startPoint: LineEndpoint.none,
  stroke: '#000000',
  tool: ToolName.line,
};
const ARROW_CONFIG: TLineToolConfig = {
  endPoint: LineEndpoint.lineArrow,
  name: 'Arrow',
  startPoint: LineEndpoint.none,
  stroke: '#000000',
  tool: ToolName.arrow,
};

describe('useDrawLineTool behaviors', () => {
  it('should not react to pointer events when the tool is not active', () => {
    // mock
    const store = createTestStore();
    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 20, 20));

    // result
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(0);
  });

  it('should create the line immediately at pointer-down and update its far endpoint, preserving drag direction, while dragging', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 60, 40));

    const nodeId = selectActivePage(store.getState()).rootOrder[0];

    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 10, 10));

    // result — unlike a box tool, the endpoints keep the exact order they were dragged in
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({
      endPoint: CONFIG.endPoint,
      startPoint: CONFIG.startPoint,
      strokes: [{ color: CONFIG.stroke, opacity: 100, type: 'solid' }],
      type: NodeType.line,
    });
    expect(getLinePoints(selectActivePage(store.getState()).nodes[nodeId] as TLineNode)).toMatchObject({ x1: 60, x2: 10, y1: 40, y2: 10 });
  });

  it('should round fractional pointer positions to whole pixels', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 60.4, 40.6));

    const nodeId = selectActivePage(store.getState()).rootOrder[0];

    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 10.2, 10.8));

    // result
    expect(getLinePoints(selectActivePage(store.getState()).nodes[nodeId] as TLineNode)).toMatchObject({ x1: 60, x2: 10, y1: 41, y2: 11 });
  });

  it('should snap the line to the nearest 15° increment while Shift is held, reusing the same angle-snap the Pen tool uses when placing a point', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action — raw angle ~11.3deg off horizontal from (0,0), well outside the un-shifted soft-snap
    // tolerance but within a 15deg increment's own tolerance once Shift forces the full snap
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));

    const nodeId = selectActivePage(store.getState()).rootOrder[0];

    canvasRef.current?.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 20, shiftKey: true }));

    // result — locked onto the 15deg line through the origin, not the raw (100,20) endpoint
    expect(getLinePoints(selectActivePage(store.getState()).nodes[nodeId] as TLineNode)).toMatchObject({ x1: 0, x2: 98, y1: 0, y2: 26 });
  });

  it('should commit the Shift-snapped endpoint, not the raw pointer position, on pointer up', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
      canvasRef.current?.dispatchEvent(new PointerEvent('pointerup', { clientX: 100, clientY: 20, shiftKey: true }));
    });

    // result
    const { design } = store.getState();
    const page = design.pages[design.activePageId];

    expect(getLinePoints(page.nodes[page.rootOrder[0]] as TLineNode)).toMatchObject({ x1: 0, x2: 98, y1: 0, y2: 26 });
  });

  it('should softly snap onto a near-cardinal angle even without Shift, matching the Pen tool’s own un-shifted magnet tolerance', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action — ~1.9deg off horizontal, within the un-shifted 5deg magnet tolerance
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));

    const nodeId = selectActivePage(store.getState()).rootOrder[0];

    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 150, 5));

    // result — snapped flat, without Shift held at all
    expect(getLinePoints(selectActivePage(store.getState()).nodes[nodeId] as TLineNode)).toMatchObject({ x1: 0, x2: 150, y1: 0, y2: 0 });
  });

  it('should re-evaluate the in-progress line immediately when Shift is pressed, without waiting for a further pointermove', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();

    // before — a diagonal well outside the un-shifted magnet tolerance
    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });

    const nodeId = selectActivePage(store.getState()).rootOrder[0];

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 100, 20));
    });

    expect(getLinePoints(selectActivePage(store.getState()).nodes[nodeId] as TLineNode)).toMatchObject({ x2: 100, y2: 20 });

    // action — Shift held, no further pointer movement
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
    });

    // result — hard-constrained to the nearest 15deg increment right away
    expect(getLinePoints(selectActivePage(store.getState()).nodes[nodeId] as TLineNode)).toMatchObject({ x2: 98, y2: 26 });
  });

  it('should re-evaluate again on keyup once Shift is released, dropping the hard constraint', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();

    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
    });

    const nodeId = selectActivePage(store.getState()).rootOrder[0];

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 100, 20));
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
    });

    expect(getLinePoints(selectActivePage(store.getState()).nodes[nodeId] as TLineNode)).toMatchObject({ x2: 98, y2: 26 });

    // action — Shift released, still no further pointer movement
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', shiftKey: false }));
    });

    // result — back to the raw, unsnapped position
    expect(getLinePoints(selectActivePage(store.getState()).nodes[nodeId] as TLineNode)).toMatchObject({ x2: 100, y2: 20 });
  });

  it('should ignore non-Shift keys and do nothing before a drag has started', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();

    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action — a non-Shift key, and Shift itself before any drag has ever started
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { altKey: true, key: 'Alt' }));
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
    });

    // result
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(0);
  });

  it('should commit a line node with the configured stroke and switch back to the default tool on pointer up', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
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
      endPoint: CONFIG.endPoint,
      name: `${CONFIG.name} (1)`,
      startPoint: CONFIG.startPoint,
      strokes: [{ color: CONFIG.stroke, opacity: 100, type: 'solid' }],
      type: NodeType.line,
    });
    expect(getLinePoints(page.nodes[page.rootOrder[0]] as TLineNode)).toMatchObject({ x1: 10, x2: 60, y1: 10, y2: 40 });
    expect(design.activeTool).toBe(ToolName.default);
    expect(page.selectedIds).toEqual([page.rootOrder[0]]);
  });

  it('should commit an arrow-configured line with an arrow endPoint but a default startPoint', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(ARROW_CONFIG.tool));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), ARROW_CONFIG), {
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

    expect(page.nodes[page.rootOrder[0]]).toMatchObject({ endPoint: LineEndpoint.lineArrow, startPoint: LineEndpoint.none });
  });

  it('should select the newly created line immediately at pointer-down, replacing any existing selection', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setSelection(['existing-node']));
    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
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

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10, 1));
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 40));

    // result
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(0);
  });

  it('should not add a node when the drag is shorter than the minimum shape size', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
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

    expect(page.rootOrder).toHaveLength(0);
    expect(design.activeTool).toBe(ToolName.default);
  });

  it('should ignore a pointer-up that was not preceded by a pointer-down', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();

    // before
    renderHook(() => useDrawLineTool(createCanvasRefs({ canvasRef }), CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 10, 10));

    // result
    expect(store.getState().design.activeTool).toBe(CONFIG.tool);
  });

  it('should arm a cancel callback on the shared drawing ref that Escape (via handleLeave) uses to delete the in-progress line and reset the tool', () => {
    // mock
    const store = createTestStore();

    store.dispatch(setActiveTool(CONFIG.tool));

    const canvasRef = createCanvasRef();
    const refs = createCanvasRefs({ canvasRef });

    // before
    renderHook(() => useDrawLineTool(refs, CONFIG), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 0, 0));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 100, 20));
      refs.drawing.cancelDrawRef.current?.();
    });

    // result
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(0);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });
});
