import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import FileColorProfileMenu from './FileColorProfileMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('FileColorProfileMenu', () => {
  it('should render every profile option, disabled, with the preferred one selected', () => {
    // before
    renderInMenu(<FileColorProfileMenu />);

    // result
    expect(screen.getByText('Same as preferred profile (sRGB)').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Assign to sRGB').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Assign to Display P3').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });
});
