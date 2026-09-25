import { ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import CanvasContextMenuPanel from './CanvasContextMenuPanel';

// store
import { removeNodeMask, toggleNodeHidden, toggleNodeLocked, toggleUiHidden } from 'store/design/slice';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

const contextMenuMock = vi.fn();

vi.mock('../hooks/useCanvasContextMenu/useCanvasContextMenu', () => ({ useCanvasContextMenu: (): unknown => contextMenuMock() }));
vi.mock('components/Design/Menu/hooks/useNodeMenuActions', () => ({ useNodeMenuActions: (): unknown => ({ onCopy: 'copy' }) }));
vi.mock('components/Design/Menu/NodeContextMenu/NodeContextMenu', () => ({
  default: ({ onRemoveMask, onToggleHidden, onToggleLocked }: Record<string, TFunc>): ReactElement => (
    <div>
      <button onClick={onRemoveMask} type="button">
        remove mask
      </button>
      <button onClick={onToggleHidden} type="button">
        toggle hidden
      </button>
      <button onClick={onToggleLocked} type="button">
        toggle locked
      </button>
    </div>
  ),
}));
vi.mock('components/Design/Menu/CanvasContextMenu/CanvasContextMenu', () => ({
  default: ({ onToggleUiHidden }: Record<string, TFunc>): ReactElement => (
    <button onClick={onToggleUiHidden} type="button">
      toggle ui
    </button>
  ),
}));

const renderPanel = (): void => {
  render(
    <Provider store={store}>
      <CanvasContextMenuPanel className="panel" refs={{} as TCanvasRefs}>
        <span>canvas</span>
      </CanvasContextMenuPanel>
    </Provider>,
  );
};

describe('CanvasContextMenuPanel behaviors', () => {
  it('should wrap the canvas and open the context menu from it', () => {
    // mock
    const onContextMenu = vi.fn();
    contextMenuMock.mockReturnValue({ anchorRef: {}, hitNode: null, isOpen: false, onContextMenu, onOpenChange: vi.fn() });

    // before
    renderPanel();

    // action
    fireEvent.contextMenu(screen.getByText('canvas'));

    // result
    expect(screen.getByText('canvas').parentElement).toHaveClass('panel');
    expect(onContextMenu).toHaveBeenCalledTimes(1);
  });

  it('should show the canvas menu over empty space and toggle the UI from it', () => {
    // mock
    contextMenuMock.mockReturnValue({ anchorRef: {}, hitNode: null, isOpen: true, onContextMenu: vi.fn(), onOpenChange: vi.fn() });

    // spy
    const dispatch = vi.spyOn(store, 'dispatch');

    // before
    renderPanel();

    // action
    fireEvent.click(screen.getByText('toggle ui'));

    // result
    expect(dispatch).toHaveBeenCalledWith(toggleUiHidden());

    // cleanup
    store.dispatch(toggleUiHidden());
    dispatch.mockRestore();
  });

  it('should show the layer menu over a layer and act on that layer', () => {
    // mock
    contextMenuMock.mockReturnValue({ anchorRef: {}, hitNode: { id: 'hit' }, isOpen: true, onContextMenu: vi.fn(), onOpenChange: vi.fn() });

    // spy
    const dispatch = vi.spyOn(store, 'dispatch');

    // before
    renderPanel();

    // action
    fireEvent.click(screen.getByText('remove mask'));
    fireEvent.click(screen.getByText('toggle hidden'));
    fireEvent.click(screen.getByText('toggle locked'));

    // result
    expect(dispatch).toHaveBeenCalledWith(removeNodeMask('hit'));
    expect(dispatch).toHaveBeenCalledWith(toggleNodeHidden('hit'));
    expect(dispatch).toHaveBeenCalledWith(toggleNodeLocked('hit'));

    // cleanup
    dispatch.mockRestore();
  });
});
