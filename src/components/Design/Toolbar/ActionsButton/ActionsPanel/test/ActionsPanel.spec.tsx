import * as PopoverPrimitive from '@radix-ui/react-popover';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ActionsPanel from '../ActionsPanel';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNode, setSelection, toggleRulers, toggleUiHidden, toggleUiMinimized } from 'store/design/slice';
import { selectActivePage, selectAreRulersVisible, selectIsUiHidden, selectIsUiMinimized, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderActionsPanel = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <PopoverPrimitive.Root open>
            <ActionsPanel />
          </PopoverPrimitive.Root>
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('ActionsPanel', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));

    if (selectIsUiMinimized(store.getState())) {
      store.dispatch(toggleUiMinimized());
    }

    if (selectIsUiHidden(store.getState())) {
      store.dispatch(toggleUiHidden());
    }

    if (selectAreRulersVisible(store.getState())) {
      store.dispatch(toggleRulers());
    }
  });

  it('should render the search input, the tab row, and every section with its items', () => {
    // before
    renderActionsPanel();

    // result
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('Plugins & widgets')).toBeInTheDocument();
    expect(screen.getByText('Recents')).toBeInTheDocument();
    expect(screen.getByText('Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Common settings')).toBeInTheDocument();
    expect(screen.getByText('Account settings')).toBeInTheDocument();
    expect(screen.getByText('Select all')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Show rulers')).toBeInTheDocument();
    expect(screen.getByText('Snap to pixel grid')).toBeInTheDocument();
    expect(screen.getByText('Minimize UI')).toBeInTheDocument();
    expect(screen.getByText('Show/Hide UI')).toBeInTheDocument();
    expect(screen.getByText('Multiplayer cursors')).toBeInTheDocument();
    expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument();
  });

  it('should filter the list down to matching items as the user types', () => {
    // before
    renderActionsPanel();

    // action
    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'select' } });

    // result
    expect(screen.getByText('Select all')).toBeInTheDocument();
    expect(screen.queryByText('Account settings')).not.toBeInTheDocument();
    expect(screen.queryByText('Recents')).not.toBeInTheDocument();
  });

  it('should select every node on the page when the "Select all" row is clicked', () => {
    // mock
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 10,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 10,
        x: 0,
        y: 0,
      }),
    );

    // before
    renderActionsPanel();

    // action
    fireEvent.click(screen.getByText('Select all'));

    // result
    expect(selectSelectedIds(store.getState())).toEqual(selectActivePage(store.getState()).rootOrder);
  });

  it('should do nothing when a not-yet-implemented row is clicked', () => {
    // before
    renderActionsPanel();

    // action
    expect(() => fireEvent.click(screen.getByText('Account settings'))).not.toThrow();

    // result
    expect(selectSelectedIds(store.getState())).toEqual([]);
  });

  it('should toggle isUiMinimized when the "Minimize UI" row is clicked', () => {
    // before
    renderActionsPanel();
    expect(selectIsUiMinimized(store.getState())).toBe(false);

    // action
    fireEvent.click(screen.getByText('Minimize UI'));

    // result
    expect(selectIsUiMinimized(store.getState())).toBe(true);
  });

  it('should toggle isUiHidden when the "Show/Hide UI" row is clicked', () => {
    // before
    renderActionsPanel();
    expect(selectIsUiHidden(store.getState())).toBe(false);

    // action
    fireEvent.click(screen.getByText('Show/Hide UI'));

    // result
    expect(selectIsUiHidden(store.getState())).toBe(true);
  });

  it('should toggle areRulersVisible when the "Show rulers" row is clicked', () => {
    // before
    renderActionsPanel();
    expect(selectAreRulersVisible(store.getState())).toBe(false);

    // action
    fireEvent.click(screen.getByText('Show rulers'));

    // result
    expect(selectAreRulersVisible(store.getState())).toBe(true);
  });

  it('should show the "Show/Hide UI" checkbox as checked while the UI is hidden', () => {
    // mock
    store.dispatch(toggleUiHidden());

    // before
    renderActionsPanel();

    // result — the row's leading checkbox indicator renders its check icon
    const row = screen.getByText('Show/Hide UI').closest('div')?.parentElement;
    expect(row?.querySelector('svg')).toBeInTheDocument();
  });
});
