import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

// components
import RulerContextMenu, { TRulerContextMenuProps } from './RulerContextMenu';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';

const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 0, 0) } };

const renderRulerContextMenu = (props: Partial<TRulerContextMenuProps> = {}): ReturnType<typeof render> =>
  render(
    <RulerContextMenu
      anchorRef={anchorRef}
      axis="x"
      hasGuides
      isOpen
      onHideRulers={vi.fn()}
      onOpenChange={vi.fn()}
      onRemoveAllGuides={vi.fn()}
      {...props}
    />,
  );

describe('RulerContextMenu', () => {
  it('should show "Remove all vertical guides" and "Hide rulers" for the vertical-guide axis', () => {
    // before
    renderRulerContextMenu({ axis: 'x' });

    // result
    expect(screen.getByText('Remove all vertical guides')).toBeInTheDocument();
    expect(screen.getByText('Hide rulers')).toBeInTheDocument();
  });

  it('should show "Remove all horizontal guides" for the horizontal-guide axis', () => {
    // before
    renderRulerContextMenu({ axis: 'y' });

    // result
    expect(screen.getByText('Remove all horizontal guides')).toBeInTheDocument();
  });

  it('should hide the remove-all item when there are no guides on that axis', () => {
    // before
    renderRulerContextMenu({ hasGuides: false });

    // result
    expect(screen.queryByText('Remove all vertical guides')).not.toBeInTheDocument();
    expect(screen.getByText('Hide rulers')).toBeInTheDocument();
  });

  it('should show the rulers shortcut next to Hide rulers', () => {
    // before
    renderRulerContextMenu();

    // result
    expect(screen.getByText('Hide rulers').closest('[role="menuitem"]')).toHaveTextContent(KEYBOARD_SHORTCUTS.rulers.join(''));
  });

  it('should call onRemoveAllGuides on click', async () => {
    // mock
    const user = userEvent.setup();
    const onRemoveAllGuides = vi.fn();

    // before
    renderRulerContextMenu({ onRemoveAllGuides });

    // action
    await user.click(screen.getByText('Remove all vertical guides'));

    // result
    expect(onRemoveAllGuides).toHaveBeenCalledTimes(1);
  });

  it('should call onHideRulers on click', async () => {
    // mock
    const user = userEvent.setup();
    const onHideRulers = vi.fn();

    // before
    renderRulerContextMenu({ onHideRulers });

    // action
    await user.click(screen.getByText('Hide rulers'));

    // result
    expect(onHideRulers).toHaveBeenCalledTimes(1);
  });
});
