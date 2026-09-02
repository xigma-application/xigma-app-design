import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

// components
import GuideContextMenu, { TGuideContextMenuProps } from './GuideContextMenu';

const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 0, 0) } };

const renderGuideContextMenu = (props: Partial<TGuideContextMenuProps> = {}): ReturnType<typeof render> =>
  render(<GuideContextMenu anchorRef={anchorRef} isOpen onOpenChange={vi.fn()} onRemove={vi.fn()} {...props} />);

describe('GuideContextMenu', () => {
  it('should show the remove item when open', () => {
    // before
    renderGuideContextMenu();

    // result
    expect(screen.getByText('Remove guide')).toBeInTheDocument();
  });

  it('should call onRemove on click', async () => {
    // mock
    const user = userEvent.setup();
    const onRemove = vi.fn();

    // before
    renderGuideContextMenu({ onRemove });

    // action
    await user.click(screen.getByText('Remove guide'));

    // result
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
