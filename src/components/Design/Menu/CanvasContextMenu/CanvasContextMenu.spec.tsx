import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

// components
import CanvasContextMenu, { TCanvasContextMenuProps } from './CanvasContextMenu';

const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 0, 0) } };

const renderCanvasContextMenu = (props: Partial<TCanvasContextMenuProps> = {}): ReturnType<typeof render> =>
  render(<CanvasContextMenu anchorRef={anchorRef} isOpen onOpenChange={vi.fn()} onToggleUiHidden={vi.fn()} {...props} />);

describe('CanvasContextMenu', () => {
  it('should show every menu item when open', () => {
    // before
    renderCanvasContextMenu();

    // result
    expect(screen.getByText('Paste here')).toBeInTheDocument();
    expect(screen.getByText('Show/Hide UI')).toBeInTheDocument();
    expect(screen.getByText('Show/Hide comments')).toBeInTheDocument();
    expect(screen.getByText('Cursor chat')).toBeInTheDocument();
    expect(screen.getByText('Actions...')).toBeInTheDocument();
    expect(screen.getByText('Plugins')).toBeInTheDocument();
    expect(screen.getByText('Widgets')).toBeInTheDocument();
  });

  it('should disable every not-yet-implemented action', () => {
    // before
    renderCanvasContextMenu();

    // result
    expect(screen.getByText('Paste here').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Show/Hide comments').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Cursor chat').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Actions...').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Plugins').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Widgets').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should enable Show/Hide UI, and call onToggleUiHidden on click', async () => {
    // mock
    const user = userEvent.setup();
    const onToggleUiHidden = vi.fn();

    // before
    renderCanvasContextMenu({ onToggleUiHidden });

    // result
    expect(screen.getByText('Show/Hide UI').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');

    // action
    await user.click(screen.getByText('Show/Hide UI'));

    // result
    expect(onToggleUiHidden).toHaveBeenCalledTimes(1);
  });
});
