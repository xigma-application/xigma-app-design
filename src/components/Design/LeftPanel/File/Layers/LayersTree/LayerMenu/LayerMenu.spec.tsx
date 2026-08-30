import userEvent from '@testing-library/user-event';
import { act, fireEvent, render, screen } from '@testing-library/react';

// components
import LayerMenu from './LayerMenu';

// types
import { TDesignPage } from 'store/design/types';

const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 0, 0) } };

const buildPage = (id: string, name: string): TDesignPage => ({
  comments: {},
  id,
  name,
  nodes: {},
  paintColor: '#d9d9d9',
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

const renderLayerMenu = (
  isHidden = false,
  isLocked = false,
  onRename = vi.fn(),
  onToggleHidden = vi.fn(),
  onToggleLocked = vi.fn(),
  onGroupSelection = vi.fn(),
  onCopy = vi.fn(),
  onPasteToReplace = vi.fn(),
  otherPages: TDesignPage[] = [],
  onMoveToPage = vi.fn(),
  onBringToFront = vi.fn(),
  onSendToBack = vi.fn(),
): ReturnType<typeof render> =>
  render(
    <LayerMenu
      anchorRef={anchorRef}
      isHidden={isHidden}
      isLocked={isLocked}
      isOpen
      onBringToFront={onBringToFront}
      onCopy={onCopy}
      onGroupSelection={onGroupSelection}
      onMoveToPage={onMoveToPage}
      onOpenChange={vi.fn()}
      onPasteToReplace={onPasteToReplace}
      onRename={onRename}
      onSendToBack={onSendToBack}
      onToggleHidden={onToggleHidden}
      onToggleLocked={onToggleLocked}
      otherPages={otherPages}
    />,
  );

describe('LayerMenu', () => {
  it('should show every menu item when open', () => {
    // before
    renderLayerMenu();

    // result
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Flatten')).toBeInTheDocument();
    expect(screen.getByText('Flip horizontal')).toBeInTheDocument();
    expect(screen.getByText('Flip vertical')).toBeInTheDocument();
  });

  it('should disable the not-yet-implemented actions', () => {
    // before
    renderLayerMenu();

    // result
    expect(screen.getByText('Flatten').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should not disable Copy, Paste to replace, Rename, Hide/Show, Lock/Unlock, Group selection, Bring to front, or Send to back', () => {
    // before
    renderLayerMenu();

    // result
    expect(screen.getByText('Copy').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Paste to replace').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Rename').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Hide layer').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Lock layer').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Group selection').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Bring to front').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Send to back').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });

  it('should call onBringToFront on Bring to front click, and onSendToBack on Send to back click', async () => {
    // mock
    const user = userEvent.setup();
    const onBringToFront = vi.fn();
    const onSendToBack = vi.fn();

    // before
    renderLayerMenu(false, false, vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), [], vi.fn(), onBringToFront, onSendToBack);

    // action
    await user.click(screen.getByText('Bring to front'));
    await user.click(screen.getByText('Send to back'));

    // result
    expect(onBringToFront).toHaveBeenCalledTimes(1);
    expect(onSendToBack).toHaveBeenCalledTimes(1);
  });

  it('should call onCopy on Copy click', async () => {
    // mock
    const user = userEvent.setup();
    const onCopy = vi.fn();

    // before
    renderLayerMenu(false, false, vi.fn(), vi.fn(), vi.fn(), vi.fn(), onCopy);

    // action
    await user.click(screen.getByText('Copy'));

    // result
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it('should call onPasteToReplace on Paste to replace click', async () => {
    // mock
    const user = userEvent.setup();
    const onPasteToReplace = vi.fn();

    // before
    renderLayerMenu(false, false, vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), onPasteToReplace);

    // action
    await user.click(screen.getByText('Paste to replace'));

    // result
    expect(onPasteToReplace).toHaveBeenCalledTimes(1);
  });

  it('should call onRename on Rename click', async () => {
    // mock
    const user = userEvent.setup();
    const onRename = vi.fn();

    // before
    renderLayerMenu(false, false, onRename);

    // action
    await user.click(screen.getByText('Rename'));

    // result
    expect(onRename).toHaveBeenCalledTimes(1);
  });

  it('should label the visibility action "Hide layer" and call onToggleHidden when the node is visible', async () => {
    // mock
    const user = userEvent.setup();
    const onToggleHidden = vi.fn();

    // before
    renderLayerMenu(false, false, vi.fn(), onToggleHidden);

    // action
    await user.click(screen.getByText('Hide layer'));

    // result
    expect(onToggleHidden).toHaveBeenCalledTimes(1);
  });

  it('should label the visibility action "Show layer" when the node is already hidden', () => {
    // before
    renderLayerMenu(true);

    // result
    expect(screen.getByText('Show layer')).toBeInTheDocument();
    expect(screen.queryByText('Hide layer')).not.toBeInTheDocument();
  });

  it('should label the lock action "Lock layer" and call onToggleLocked when the node is unlocked', async () => {
    // mock
    const user = userEvent.setup();
    const onToggleLocked = vi.fn();

    // before
    renderLayerMenu(false, false, vi.fn(), vi.fn(), onToggleLocked);

    // action
    await user.click(screen.getByText('Lock layer'));

    // result
    expect(onToggleLocked).toHaveBeenCalledTimes(1);
  });

  it('should label the lock action "Unlock layer" when the node is already locked', () => {
    // before
    renderLayerMenu(false, true);

    // result
    expect(screen.getByText('Unlock layer')).toBeInTheDocument();
    expect(screen.queryByText('Lock layer')).not.toBeInTheDocument();
  });

  it('should call onGroupSelection on Group selection click', async () => {
    // mock
    const user = userEvent.setup();
    const onGroupSelection = vi.fn();

    // before
    renderLayerMenu(false, false, vi.fn(), vi.fn(), vi.fn(), onGroupSelection);

    // action
    await user.click(screen.getByText('Group selection'));

    // result
    expect(onGroupSelection).toHaveBeenCalledTimes(1);
  });

  it('should disable "Move to page" when there are no other pages to move to', () => {
    // before
    renderLayerMenu();

    // result
    expect(screen.getByText('Move to page').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should list every other page under "Move to page" and call onMoveToPage with the clicked page’s id', () => {
    // mock
    vi.useFakeTimers();
    const onMoveToPage = vi.fn();
    const otherPages = [buildPage('page-2', 'Page 2'), buildPage('page-3', 'Page 3')];

    // before
    renderLayerMenu(false, false, vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), otherPages, onMoveToPage);

    // result — enabled, and not itself listing the active page
    expect(screen.getByText('Move to page').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');

    // action
    fireEvent.pointerEnter(screen.getByText('Move to page'));
    act(() => vi.runAllTimers());
    expect(screen.getByText('Page 2')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Page 3'));

    // result
    expect(onMoveToPage).toHaveBeenCalledTimes(1);
    expect(onMoveToPage).toHaveBeenCalledWith('page-3');

    // after
    vi.useRealTimers();
  });
});
