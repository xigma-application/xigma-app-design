import userEvent from '@testing-library/user-event';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import MenuItem from './MenuItem';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('MenuItem snapshots', () => {
  it('should render a selected MenuItem with an icon and a shortcut', () => {
    // before
    renderInMenu(<MenuItem icon="FrameTool" label="Frame" selected shortcut="F" />);

    // result
    expect(screen.getByRole('menuitem')).toMatchSnapshot();
  });

  it('should render a disabled MenuItem', () => {
    // before
    renderInMenu(<MenuItem disabled icon="FrameTool" label="Frame" shortcut="F" />);

    // result
    expect(screen.getByRole('menuitem')).toMatchSnapshot();
  });
});

describe('MenuItem behaviors', () => {
  it('should call onClick when clicked', async () => {
    // mock
    const user = userEvent.setup();
    const onClick = vi.fn();

    // before
    renderInMenu(<MenuItem label="Frame" onClick={onClick} />);

    // action
    await user.click(screen.getByText('Frame'));

    // result
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', async () => {
    // mock
    const user = userEvent.setup();
    const onClick = vi.fn();

    // before
    renderInMenu(<MenuItem disabled label="Frame" onClick={onClick} />);

    // action
    await user.click(screen.getByText('Frame'));

    // result
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should merge a caller-supplied shortcutClassName onto the shortcut element', () => {
    // before
    renderInMenu(<MenuItem label="Frame" shortcut="F" shortcutClassName="custom-shortcut" />);

    // result
    const shortcut = screen.getByText('F');

    expect(shortcut.className).toContain('custom-shortcut');
    expect(shortcut.className).toContain('MenuItem__shortcut');
  });
});
