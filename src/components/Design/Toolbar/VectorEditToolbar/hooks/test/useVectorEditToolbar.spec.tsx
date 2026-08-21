import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { useVectorEditToolbar } from '../useVectorEditToolbar';

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
        {result.current.renderTool({ icon: 'MoveVectorTool', labelKey: 'design.toolbar.tool.default', toolName: ToolName.default })}
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
        {result.current.renderTool({ icon: 'MoveVectorTool', labelKey: 'design.toolbar.tool.default', toolName: ToolName.default })}
      </Provider>,
    );

    // result
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render a tool with no ToolName as inert — never active, no click handler', () => {
    // before
    store.dispatch(setActiveTool(ToolName.pen));

    const { result } = renderUseVectorEditToolbar();

    render(
      <Provider store={store}>
        {result.current.renderTool({ icon: 'PaintTool', labelKey: 'design.toolbar.vectorEditToolbar.tool.paint' })}
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
