import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import MoreLayoutOptionsMenu from './MoreLayoutOptionsMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('MoreLayoutOptionsMenu', () => {
  it('should render every row with its label, disabled until implemented', () => {
    // before
    renderInMenu(<MoreLayoutOptionsMenu />);

    // result
    [
      'Suggest auto layout',
      'Remove all auto layout',
      'Lock aspect ratio',
      'Unlock aspect ratio',
      'Resize to fit',
      'Set width to hug contents',
      'Set height to hug contents',
      'Set width to fill container',
      'Set height to fill container',
    ].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
  });

  it('should show the shortcuts', () => {
    // before
    renderInMenu(<MoreLayoutOptionsMenu />);

    // result
    expect(screen.getByText('⌃⇧A')).toBeInTheDocument();
    expect(screen.getByText('⌥⇧⌘R')).toBeInTheDocument();
  });
});
