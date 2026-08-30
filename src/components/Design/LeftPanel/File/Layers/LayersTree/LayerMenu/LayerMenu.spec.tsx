import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

// components
import LayerMenu from './LayerMenu';

const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 0, 0) } };

const renderLayerMenu = (
  isHidden = false,
  isLocked = false,
  onRename = vi.fn(),
  onToggleHidden = vi.fn(),
  onToggleLocked = vi.fn(),
  onGroupSelection = vi.fn(),
  onCopy = vi.fn(),
): ReturnType<typeof render> =>
  render(
    <LayerMenu
      anchorRef={anchorRef}
      isHidden={isHidden}
      isLocked={isLocked}
      isOpen
      onCopy={onCopy}
      onGroupSelection={onGroupSelection}
      onOpenChange={vi.fn()}
      onRename={onRename}
      onToggleHidden={onToggleHidden}
      onToggleLocked={onToggleLocked}
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
    expect(screen.getByText('Flatten').closest('div')?.className).toMatch(/--disabled/);
  });

  it('should not disable Copy, Rename, Hide/Show, Lock/Unlock, or Group selection', () => {
    // before
    renderLayerMenu();

    // result
    expect(screen.getByText('Copy').closest('div')?.className).not.toMatch(/--disabled/);
    expect(screen.getByText('Rename').closest('div')?.className).not.toMatch(/--disabled/);
    expect(screen.getByText('Hide layer').closest('div')?.className).not.toMatch(/--disabled/);
    expect(screen.getByText('Lock layer').closest('div')?.className).not.toMatch(/--disabled/);
    expect(screen.getByText('Group selection').closest('div')?.className).not.toMatch(/--disabled/);
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
});
