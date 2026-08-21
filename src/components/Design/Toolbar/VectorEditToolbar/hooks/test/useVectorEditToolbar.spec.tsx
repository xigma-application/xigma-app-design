import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import { TooltipProvider } from 'shared';

// hooks
import { getIsVectorEditToolActive, useVectorEditToolbar } from '../useVectorEditToolbar';

// store
import { setActiveTool, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderUseVectorEditToolbar = (): ReturnType<typeof renderHook<ReturnType<typeof useVectorEditToolbar>, unknown>> =>
  renderHook(() => useVectorEditToolbar(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

describe('useVectorEditToolbar', () => {
  beforeEach(() => {
    store.dispatch(setVectorEditingNodeId(null));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should expose the current vector-editing node id', () => {
    // before
    store.dispatch(setVectorEditingNodeId('node-1'));

    const { result } = renderUseVectorEditToolbar();

    // result
    expect(result.current.vectorEditingNodeId).toBe('node-1');
  });

  it('should exit Vector Edit Mode and reset the active tool via handleClose', () => {
    // before
    store.dispatch(setVectorEditingNodeId('node-1'));
    store.dispatch(setActiveTool(ToolName.pen));

    const { result } = renderUseVectorEditToolbar();

    // action
    act(() => {
      result.current.handleClose();
    });

    // result
    expect(store.getState().design.vectorEditingNodeId).toBeNull();
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should render a tool with a real ToolName as active exactly when it is the active tool, and switch the active tool on click', () => {
    // before
    const { result } = renderUseVectorEditToolbar();

    render(
      <Provider store={store}>
        <TooltipProvider>
          {result.current.renderTool({ icon: 'MoveVectorTool', labelKey: 'design.toolbar.tool.default', toolName: ToolName.default })}
        </TooltipProvider>
      </Provider>,
    );

    // result
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');

    // action
    act(() => {
      store.dispatch(setActiveTool(ToolName.pen));
    });
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should not show a real-ToolName tool as active when a DIFFERENT real tool is the active one — not just "not Pen"', () => {
    // before — Lasso is active, not Pen and not Move's own default either
    store.dispatch(setActiveTool(ToolName.lasso));

    const { result } = renderUseVectorEditToolbar();

    render(
      <Provider store={store}>
        <TooltipProvider>
          {result.current.renderTool({ icon: 'MoveVectorTool', labelKey: 'design.toolbar.tool.default', toolName: ToolName.default })}
        </TooltipProvider>
      </Provider>,
    );

    // result
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should dispatch Bend as the real active tool on click, and show it active when Bend already is the active tool', () => {
    // before
    store.dispatch(setActiveTool(ToolName.bend));

    const { result } = renderUseVectorEditToolbar();

    render(
      <Provider store={store}>
        <TooltipProvider>
          {result.current.renderTool({ icon: 'BendTool', labelKey: 'design.toolbar.vectorEditToolbar.tool.bend', toolName: ToolName.bend })}
        </TooltipProvider>
      </Provider>,
    );

    // result
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');

    // action
    act(() => {
      store.dispatch(setActiveTool(ToolName.default));
    });
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.bend);
  });

  it('should render a tool with no ToolName as inert — never active, no click handler', () => {
    // before
    store.dispatch(setActiveTool(ToolName.pen));

    const { result } = renderUseVectorEditToolbar();

    render(
      <Provider store={store}>
        <TooltipProvider>
          {result.current.renderTool({ icon: 'PaintTool', labelKey: 'design.toolbar.vectorEditToolbar.tool.paint' })}
        </TooltipProvider>
      </Provider>,
    );

    // result
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-pressed', 'false');

    // action — clicking an inert tool must not throw or dispatch anything
    fireEvent.click(button);

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.pen);
  });
});

describe('getIsVectorEditToolActive', () => {
  it('should return false for a tool with no ToolName', () => {
    // result
    expect(getIsVectorEditToolActive(undefined, ToolName.move, false)).toBe(false);
  });

  it('should show Move active when it is the real active tool and Ctrl is not held', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.move, ToolName.move, false)).toBe(true);
  });

  it('should hide Move’s active state while Ctrl is held, even though it is still the real active tool', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.move, ToolName.move, true)).toBe(false);
  });

  it('should show Bend active when it is the real active tool, regardless of Ctrl', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.bend, ToolName.bend, false)).toBe(true);
    expect(getIsVectorEditToolActive(ToolName.bend, ToolName.bend, true)).toBe(true);
  });

  it('should preview Bend as active while Ctrl is held and Move is the real active tool, with no other real tool active', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.bend, ToolName.move, true)).toBe(true);
  });

  it('should not preview Bend when Ctrl is not held, even with Move as the real active tool', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.bend, ToolName.move, false)).toBe(false);
  });

  it('should not preview Bend while some other real tool (not Move) is active, even with Ctrl held', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.bend, ToolName.lasso, true)).toBe(false);
  });

  it('should fall back to a plain equality check for every other tool', () => {
    // result
    expect(getIsVectorEditToolActive(ToolName.lasso, ToolName.lasso, false)).toBe(true);
    expect(getIsVectorEditToolActive(ToolName.lasso, ToolName.paint, false)).toBe(false);
  });
});
