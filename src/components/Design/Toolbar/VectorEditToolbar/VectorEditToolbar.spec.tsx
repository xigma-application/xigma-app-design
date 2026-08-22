import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditToolbar from './VectorEditToolbar';
import { TooltipProvider } from 'shared';

// store
import { setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderVectorEditToolbar = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <VectorEditToolbar />
      </TooltipProvider>
    </Provider>,
  );

describe('VectorEditToolbar', () => {
  beforeEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should render nothing when not in Vector Edit Mode', () => {
    // before
    const { container } = renderVectorEditToolbar();

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render the toolbar once a node enters Vector Edit Mode', () => {
    // before
    act(() => store.dispatch(setVectorEditingNodeIds(['node-1'])));

    renderVectorEditToolbar();

    // result
    expect(screen.getByText('Move')).toBeInTheDocument();
    expect(screen.getByText('Lasso')).toBeInTheDocument();
    expect(screen.getByText('Paint')).toBeInTheDocument();
    expect(screen.getByText('Bend')).toBeInTheDocument();
    expect(screen.getByText('Cut')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('should show Move as active whenever the Move tool is the active tool', () => {
    // before
    act(() => {
      store.dispatch(setVectorEditingNodeIds(['node-1']));
      store.dispatch(setActiveTool(ToolName.move));
    });

    renderVectorEditToolbar();

    // result
    expect(screen.getByRole('button', { name: 'Move' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('should show no tool as active while the Pen tool is active', () => {
    // before
    act(() => {
      store.dispatch(setVectorEditingNodeIds(['node-1']));
      store.dispatch(setActiveTool(ToolName.pen));
    });

    renderVectorEditToolbar();

    // result
    expect(screen.getByRole('button', { name: 'Move' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('should switch the active tool back to Move when clicking Move, e.g. to interrupt the Pen tool', () => {
    // before
    act(() => {
      store.dispatch(setVectorEditingNodeIds(['node-1']));
      store.dispatch(setActiveTool(ToolName.pen));
    });

    renderVectorEditToolbar();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Move' }));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should switch to Bend and keep it active after clicking it, independent of Ctrl/Cmd', () => {
    // before
    act(() => store.dispatch(setVectorEditingNodeIds(['node-1'])));

    renderVectorEditToolbar();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Bend' }));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.bend);
    expect(screen.getByRole('button', { name: 'Bend' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('should visually preview Bend instead of Move while Ctrl is held, reverting to Move on release, with no change to the real active tool', () => {
    // before
    act(() => {
      store.dispatch(setVectorEditingNodeIds(['node-1']));
      store.dispatch(setActiveTool(ToolName.move));
    });

    renderVectorEditToolbar();

    expect(screen.getByRole('button', { name: 'Move' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Bend' })).toHaveAttribute('aria-pressed', 'false');

    // action
    fireEvent.keyDown(window, { key: 'Control' });

    // result — visual only, the real active tool never changes
    expect(screen.getByRole('button', { name: 'Move' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Bend' })).toHaveAttribute('aria-pressed', 'true');
    expect(store.getState().design.activeTool).toBe(ToolName.move);

    // action
    fireEvent.keyUp(window, { key: 'Control' });

    // result
    expect(screen.getByRole('button', { name: 'Move' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Bend' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('should exit Vector Edit Mode and reset the active tool when clicking the close button', () => {
    // before
    act(() => {
      store.dispatch(setVectorEditingNodeIds(['node-1']));
      store.dispatch(setActiveTool(ToolName.pen));
    });

    renderVectorEditToolbar();

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    // result
    expect(store.getState().design.vectorEditingNodeIds).toEqual([]);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });
});
