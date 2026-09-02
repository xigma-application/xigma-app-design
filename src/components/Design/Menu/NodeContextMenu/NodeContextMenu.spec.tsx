import userEvent from '@testing-library/user-event';
import { act, fireEvent, render, screen } from '@testing-library/react';

// components
import NodeContextMenu, { TNodeContextMenuProps } from './NodeContextMenu';

// types
import { NodeType } from 'types/design/enums';
import { TDesignPage } from 'store/design/types';
import { TFrameNode, TGroupNode, TLineNode, TRectangleNode, TSectionNode, TTextNode } from 'types/design/types';

const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 0, 0) } };

const BASE_NODE = {
  height: 100,
  id: 'node-1',
  name: 'Node',
  parentId: null,
  rotation: 0,
  width: 100,
  x: 0,
  y: 0,
};

const buildRectangleNode = (): TRectangleNode => ({ ...BASE_NODE, fill: '#000000', type: NodeType.rectangle });
const buildFrameNode = (): TFrameNode => ({ ...BASE_NODE, fill: '#000000', type: NodeType.frame });
const buildSectionNode = (): TSectionNode => ({ ...BASE_NODE, fill: '#000000', type: NodeType.section });
const buildGroupNode = (): TGroupNode => ({ ...BASE_NODE, childIds: [], type: NodeType.group });
const buildLineNode = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  id: 'node-1',
  name: 'Line',
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 0,
  x2: 100,
  y1: 0,
  y2: 0,
  ...overrides,
});

const buildTextNode = (pathId: string | null = null): TTextNode => ({
  ...BASE_NODE,
  content: 'Hello',
  fill: '#000000',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 16,
  pathId,
  type: NodeType.text,
});

const buildPage = (id: string, name: string): TDesignPage => ({
  comments: {},
  guides: [],
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
      node={buildRectangleNode()}
      onBringToFront={vi.fn()}
      onCopy={vi.fn()}
      onFlatten={vi.fn()}
      onFlipHorizontal={vi.fn()}
      onFlipVertical={vi.fn()}
      onGroupSelection={vi.fn()}
      onMoveToPage={vi.fn()}
      onOpenChange={vi.fn()}
      onOutlineStroke={vi.fn()}
      onPasteToReplace={vi.fn()}
      onRemoveMask={vi.fn()}
      onRename={vi.fn()}
      onSendToBack={vi.fn()}
      onToggleHidden={vi.fn()}
      onToggleLocked={vi.fn()}
      onUngroupSelection={vi.fn()}
      onUseAsMask={vi.fn()}
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

  it('should hide Rename when onRename is not given (e.g. triggered from the canvas, which has no rename affordance, matching Figma)', () => {
    // before
    renderNodeContextMenu({ onRename: undefined });

    // result
    expect(screen.queryByText('Rename')).not.toBeInTheDocument();
  });

  it('should disable the not-yet-implemented actions', () => {
    // before
    renderNodeContextMenu();

    // result
    expect(screen.getByText('Plugins').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should enable Use as mask for a non-mask node, and call onUseAsMask on click', async () => {
    // mock
    const user = userEvent.setup();
    const onUseAsMask = vi.fn();

    // before
    renderNodeContextMenu({ node: buildRectangleNode(), onUseAsMask });

    // result
    expect(screen.getByText('Use as mask').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.queryByText('Remove mask')).not.toBeInTheDocument();

    // action
    await user.click(screen.getByText('Use as mask'));

    // result
    expect(onUseAsMask).toHaveBeenCalledTimes(1);
  });

  it('should show Remove mask instead of Use as mask for a mask node, and call onRemoveMask on click', async () => {
    // mock
    const user = userEvent.setup();
    const onRemoveMask = vi.fn();

    // before
    renderNodeContextMenu({ node: { ...buildRectangleNode(), isMask: true }, onRemoveMask });

    // result
    expect(screen.queryByText('Use as mask')).not.toBeInTheDocument();
    expect(screen.getByText('Remove mask').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');

    // action
    await user.click(screen.getByText('Remove mask'));

    // result
    expect(onRemoveMask).toHaveBeenCalledTimes(1);
  });

  it('should not show Use as mask or Remove mask for a section', () => {
    // before
    renderNodeContextMenu({ node: buildSectionNode() });

    // result
    expect(screen.queryByText('Use as mask')).not.toBeInTheDocument();
    expect(screen.queryByText('Remove mask')).not.toBeInTheDocument();
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

  it('should enable Flatten for a shape convertible to a vector, and call onFlatten on click', async () => {
    // mock
    const user = userEvent.setup();
    const onFlatten = vi.fn();

    // before
    renderNodeContextMenu({ node: buildRectangleNode(), onFlatten });

    // result
    expect(screen.getByText('Flatten').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');

    // action
    await user.click(screen.getByText('Flatten'));

    // result
    expect(onFlatten).toHaveBeenCalledTimes(1);
  });

  it('should enable Flip horizontal/vertical and call the matching handler on click', async () => {
    // mock
    const user = userEvent.setup();
    const onFlipHorizontal = vi.fn();
    const onFlipVertical = vi.fn();

    // before
    renderNodeContextMenu({ onFlipHorizontal, onFlipVertical });

    // result
    expect(screen.getByText('Flip horizontal').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Flip vertical').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');

    // action
    await user.click(screen.getByText('Flip horizontal'));

    // result
    expect(onFlipHorizontal).toHaveBeenCalledTimes(1);
    expect(onFlipVertical).not.toHaveBeenCalled();
  });

  it('should keep Outline stroke disabled for a shape with no stroke set', () => {
    // before
    renderNodeContextMenu({ node: buildRectangleNode() });

    // result
    expect(screen.getByText('Outline stroke').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should enable Outline stroke for a shape with a stroke, and call onOutlineStroke on click', async () => {
    // mock
    const user = userEvent.setup();
    const onOutlineStroke = vi.fn();
    const node = { ...buildRectangleNode(), strokeColor: '#000000', strokeWidth: 2 };

    // before
    renderNodeContextMenu({ node, onOutlineStroke });

    // result
    expect(screen.getByText('Outline stroke').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');

    // action
    await user.click(screen.getByText('Outline stroke'));

    // result
    expect(onOutlineStroke).toHaveBeenCalledTimes(1);
  });

  it('should enable Outline stroke for a line node with its own stroke set (checked via "stroke", not "strokeColor")', () => {
    // before
    renderNodeContextMenu({ node: buildLineNode({ strokeWidth: 2 }) });

    // result
    expect(screen.getByText('Outline stroke').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });

  it('should keep Outline stroke disabled for a line node with no stroke color set', () => {
    // before
    renderNodeContextMenu({ node: buildLineNode({ stroke: '', strokeWidth: 2 }) });

    // result
    expect(screen.getByText('Outline stroke').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
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
    renderNodeContextMenu({ node: buildFrameNode() });

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
    renderNodeContextMenu({ node: buildRectangleNode() });

    // result
    expect(screen.getByText('Flatten')).toBeInTheDocument();
    expect(screen.getByText('Outline stroke')).toBeInTheDocument();
    expect(screen.queryByText('Convert to section')).not.toBeInTheDocument();
    expect(screen.queryByText('Ungroup')).not.toBeInTheDocument();
    expect(screen.queryByText('Set as thumbnail')).not.toBeInTheDocument();
    expect(screen.queryByText('More layout options')).not.toBeInTheDocument();
  });

  it('should show Convert to section, Ungroup (enabled) and More layout options for a group node, but not Set as thumbnail or Convert to frame', () => {
    // before
    renderNodeContextMenu({ node: buildGroupNode() });

    // result
    expect(screen.getByText('Convert to section')).toBeInTheDocument();
    expect(screen.getByText('Ungroup').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('More layout options')).toBeInTheDocument();
    expect(screen.queryByText('Set as thumbnail')).not.toBeInTheDocument();
    expect(screen.queryByText('Convert to frame')).not.toBeInTheDocument();
  });

  it('should call onUngroupSelection on Ungroup click for a group node', async () => {
    // mock
    const user = userEvent.setup();
    const onUngroupSelection = vi.fn();

    // before
    renderNodeContextMenu({ node: buildGroupNode(), onUngroupSelection });

    // action
    await user.click(screen.getByText('Ungroup'));

    // result
    expect(onUngroupSelection).toHaveBeenCalledTimes(1);
  });

  it('should keep Ungroup disabled for a frame node, unlike a group node', () => {
    // before
    renderNodeContextMenu({ node: buildFrameNode() });

    // result
    expect(screen.getByText('Ungroup').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should keep Ungroup disabled for a section node, unlike a group node', () => {
    // before
    renderNodeContextMenu({ node: buildSectionNode() });

    // result
    expect(screen.getByText('Ungroup').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should show Flatten and Outline stroke, disabled, for a group node — the underlying operation only supports single shapes so far', () => {
    // before
    renderNodeContextMenu({ node: buildGroupNode() });

    // result
    expect(screen.getByText('Flatten').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Outline stroke').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should show the section-only items (Convert to frame, Ungroup, Set as thumbnail, More layout options) for a section node', () => {
    // before
    renderNodeContextMenu({ node: buildSectionNode() });

    // result
    expect(screen.getByText('Convert to frame')).toBeInTheDocument();
    expect(screen.getByText('Ungroup')).toBeInTheDocument();
    expect(screen.getByText('Set as thumbnail')).toBeInTheDocument();
    expect(screen.getByText('More layout options')).toBeInTheDocument();
  });

  it('should hide Frame/Group/Flatten/Use-as-mask/Auto-layout/Create-component/Flip and the Send-to-Make/Add-motion items for a section node', () => {
    // before
    renderNodeContextMenu({ node: buildSectionNode() });

    // result
    expect(screen.queryByText('Send to Make')).not.toBeInTheDocument();
    expect(screen.queryByText('Add motion')).not.toBeInTheDocument();
    expect(screen.queryByText('Convert to section')).not.toBeInTheDocument();
    expect(screen.queryByText('Group selection')).not.toBeInTheDocument();
    expect(screen.queryByText('Frame selection')).not.toBeInTheDocument();
    expect(screen.queryByText('Flatten')).not.toBeInTheDocument();
    expect(screen.queryByText('Outline stroke')).not.toBeInTheDocument();
    expect(screen.queryByText('Use as mask')).not.toBeInTheDocument();
    expect(screen.queryByText('Add auto layout')).not.toBeInTheDocument();
    expect(screen.queryByText('Create component')).not.toBeInTheDocument();
    expect(screen.queryByText('Flip horizontal')).not.toBeInTheDocument();
    expect(screen.queryByText('Flip vertical')).not.toBeInTheDocument();
  });

  it('should show "Create separate layers" and hide "Send to Figma Make" for a text node attached to a path', () => {
    // before
    renderNodeContextMenu({ node: buildTextNode('path-1') });

    // result
    expect(screen.getByText('Create separate layers')).toBeInTheDocument();
    expect(screen.queryByText('Send to Make')).not.toBeInTheDocument();
  });

  it('should hide "Create separate layers" and show "Send to Figma Make" for a plain text node not on a path', () => {
    // before
    renderNodeContextMenu({ node: buildTextNode(null) });

    // result
    expect(screen.queryByText('Create separate layers')).not.toBeInTheDocument();
    expect(screen.getByText('Send to Make')).toBeInTheDocument();
  });

  it('should enable Flatten for a text node attached to a path, matching Figma’s own text-on-path support', () => {
    // before
    renderNodeContextMenu({ node: buildTextNode('path-1') });

    // result
    expect(screen.getByText('Flatten').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });

  it('should enable Outline stroke for a text node attached to a path even with no stroke set, same as Flatten', () => {
    // before — there's no properties-panel UI to ever set a real stroke on text yet, so this stays
    // available unconditionally: it's really per-letter flatten + group, not a real stroke band
    renderNodeContextMenu({ node: buildTextNode('path-1') });

    // result
    expect(screen.getByText('Outline stroke').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });
});
