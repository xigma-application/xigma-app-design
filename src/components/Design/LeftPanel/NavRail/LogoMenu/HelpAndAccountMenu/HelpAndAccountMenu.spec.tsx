import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import HelpAndAccountMenu from './HelpAndAccountMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('HelpAndAccountMenu', () => {
  it('should render every row with its label, disabled until implemented', () => {
    // before
    renderInMenu(<HelpAndAccountMenu />);

    // result
    [
      'Help page',
      'Keyboard shortcuts',
      'Support forum',
      'Video tutorials',
      'Release notes',
      'Open font settings',
      'Legal summary',
      'Account settings',
      'Log out',
    ].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
  });

  it('should show the keyboard shortcuts combo', () => {
    // before
    renderInMenu(<HelpAndAccountMenu />);

    // result
    expect(screen.getByText('⌃⇧?')).toBeInTheDocument();
  });
});
