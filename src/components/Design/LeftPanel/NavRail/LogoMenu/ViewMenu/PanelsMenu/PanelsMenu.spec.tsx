import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import PanelsMenu from './PanelsMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('PanelsMenu', () => {
  it('should render every row with its label, disabled until implemented', () => {
    // before
    renderInMenu(<PanelsMenu />);

    // result
    ['Open layers panel', 'Libraries', 'Open design panel', 'Open prototype panel', 'Toggle variables'].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
  });

  it('should show each shortcut', () => {
    // before
    renderInMenu(<PanelsMenu />);

    // result
    expect(screen.getByText('⌥1')).toBeInTheDocument();
    expect(screen.getByText('⌥2')).toBeInTheDocument();
    expect(screen.getByText('⌥8')).toBeInTheDocument();
    expect(screen.getByText('⌥9')).toBeInTheDocument();
  });
});
