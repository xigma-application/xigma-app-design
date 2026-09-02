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
  it('should render a single disabled placeholder row', () => {
    // before
    renderInMenu(<FileColorProfileMenu />);

    // result
    expect(screen.getByText('Coming soon').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });
});
