import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import SlotsMenu from './SlotsMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('SlotsMenu', () => {
  it('should render every row with its label, disabled until implemented', () => {
    // before
    renderInMenu(<SlotsMenu />);

    // result
    ['Convert to slot', 'Convert to frame', 'Wrap in new slot', 'Reset slot'].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
  });

  it('should show the Convert to slot shortcut', () => {
    // before
    renderInMenu(<SlotsMenu />);

    // result
    expect(screen.getByText('⇧⌘S')).toBeInTheDocument();
  });
});
