import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import AddToSidebarMenu from './AddToSidebarMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('AddToSidebarMenu', () => {
  it('should render a disabled Starred row', () => {
    // before
    renderInMenu(<AddToSidebarMenu />);

    // result
    expect(screen.getByText('Starred').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });
});
