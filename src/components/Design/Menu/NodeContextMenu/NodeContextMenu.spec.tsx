import userEvent from '@testing-library/user-event';
import { act, fireEvent, render, screen } from '@testing-library/react';

// components
import NodeContextMenu, { TNodeContextMenuProps } from './NodeContextMenu';

// types
import { NodeType } from 'types/design/enums';
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

const renderNodeContextMenu = (props: Partial<TNodeContextMenuProps> = {}): ReturnType<typeof render> =>
  render(
    <NodeContextMenu
      anchorRef={anchorRef}
      isOpen
      nodeType={NodeType.rectangle}
      onBringToFront={vi.fn()}
      onCopy={vi.fn()}
      onGroupSelection={vi.fn()}
      onMoveToPage={vi.fn()}
      onOpenChange={vi.fn()}
      onPasteToReplace={vi.fn()}
      onRename={vi.fn()}
      onSendToBack={vi.fn()}
      onToggleHidden={vi.fn()}
      onToggleLocked={vi.fn()}
      otherPages={[]}
      {...props}
    />,
  );

describe('NodeContextMenu', () => {
  it('should show every menu item when open', () => {
    // before
    renderNodeContextMenu();

    // result
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Flatten')).toBeInTheDocument();
    expect(screen.getByText('Flip horizontal')).toBeInTheDocument();
    expect(screen.getByText('Flip vertical')).toBeInTheDocument();
  });

  it('should disable the not-yet-implemented actions', () => {
    // before
    renderNodeContextMenu();

    // result
    expect(screen.getByText('Flatten').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should not disable Copy, Paste to replace, Rename, Show/Hide, Lock/Unlock, Group selection, Bring to front, or Send to back', () => {
    // before
    renderNodeContextMenu();

    // result
    expect(screen.getByText('Copy').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Paste to replace').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Rename').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Show/Hide').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Lock/Unlock').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
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
    renderNodeContextMenu({ onBringToFront, onSendToBack });

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
    renderNodeContextMenu({ onCopy });

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
    renderNodeContextMenu({ onPasteToReplace });

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
    renderNodeContextMenu({ onRename });

    // action
    await user.click(screen.getByText('Rename'));

    // result
    expect(onRename).toHaveBeenCalledTimes(1);
  });

  it('should call onToggleHidden on Show/Hide click', async () => {
    // mock
    const user = userEvent.setup();
    const onToggleHidden = vi.fn();

    // before
    renderNodeContextMenu({ onToggleHidden });

    // action
    await user.click(screen.getByText('Show/Hide'));

    // result
    expect(onToggleHidden).toHaveBeenCalledTimes(1);
  });

  it('should call onToggleLocked on Lock/Unlock click', async () => {
    // mock
    const user = userEvent.setup();
    const onToggleLocked = vi.fn();

    // before
    renderNodeContextMenu({ onToggleLocked });

    // action
    await user.click(screen.getByText('Lock/Unlock'));

    // result
    expect(onToggleLocked).toHaveBeenCalledTimes(1);
  });

  it('should call onGroupSelection on Group selection click', async () => {
    // mock
    const user = userEvent.setup();
    const onGroupSelection = vi.fn();

    // before
    renderNodeContextMenu({ onGroupSelection });

    // action
    await user.click(screen.getByText('Group selection'));

    // result
    expect(onGroupSelection).toHaveBeenCalledTimes(1);
  });

  it('should disable "Move to page" when there are no other pages to move to', () => {
    // before
    renderNodeContextMenu();

    // result
    expect(screen.getByText('Move to page').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should list every other page under "Move to page" and call onMoveToPage with the clicked page’s id', () => {
    // mock
    vi.useFakeTimers();
    const onMoveToPage = vi.fn();
    const otherPages = [buildPage('page-2', 'Page 2'), buildPage('page-3', 'Page 3')];

    // before
    renderNodeContextMenu({ onMoveToPage, otherPages });

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

  it('should show the frame-only items and hide Flatten / Outline stroke for a frame node', () => {
    // before
    renderNodeContextMenu({ nodeType: NodeType.frame });

    // result
    expect(screen.getByText('Convert to section')).toBeInTheDocument();
    expect(screen.getByText('Ungroup')).toBeInTheDocument();
    expect(screen.getByText('Set as thumbnail')).toBeInTheDocument();
    expect(screen.getByText('More layout options')).toBeInTheDocument();
    expect(screen.queryByText('Flatten')).not.toBeInTheDocument();
    expect(screen.queryByText('Outline stroke')).not.toBeInTheDocument();
  });

  it('should hide the frame-only items and show Flatten / Outline stroke for a non-frame node', () => {
    // before
    renderNodeContextMenu({ nodeType: NodeType.rectangle });

    // result
    expect(screen.getByText('Flatten')).toBeInTheDocument();
    expect(screen.getByText('Outline stroke')).toBeInTheDocument();
    expect(screen.queryByText('Convert to section')).not.toBeInTheDocument();
    expect(screen.queryByText('Ungroup')).not.toBeInTheDocument();
    expect(screen.queryByText('Set as thumbnail')).not.toBeInTheDocument();
    expect(screen.queryByText('More layout options')).not.toBeInTheDocument();
  });
});
