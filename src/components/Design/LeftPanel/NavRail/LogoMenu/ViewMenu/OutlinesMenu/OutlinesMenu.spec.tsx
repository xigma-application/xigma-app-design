import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import OutlinesMenu from './OutlinesMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('OutlinesMenu', () => {
  it('should render every row with its label, disabled until implemented', () => {
    // before
    renderInMenu(<OutlinesMenu />);

    // result
    ['Show outlines', 'Include hidden layers', 'Include object bounds'].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
  });

  it('should show the Show outlines shortcut', () => {
    // before
    renderInMenu(<OutlinesMenu />);

    // result
    expect(screen.getByText('⇧⌘O')).toBeInTheDocument();
  });
});
