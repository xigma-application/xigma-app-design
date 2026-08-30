import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import MainComponentMenu from './MainComponentMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('MainComponentMenu', () => {
  it('should render every row with its label, disabled until implemented', () => {
    // before
    renderInMenu(<MainComponentMenu />);

    // result
    ['Go to main component', 'Push changes to main component', 'Restore main component'].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
  });

  it('should show the Go to main component shortcut', () => {
    // before
    renderInMenu(<MainComponentMenu />);

    // result
    expect(screen.getByText('⌃⌥⌘K')).toBeInTheDocument();
  });
});
