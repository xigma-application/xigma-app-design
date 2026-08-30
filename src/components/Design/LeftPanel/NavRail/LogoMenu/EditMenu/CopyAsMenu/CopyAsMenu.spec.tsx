import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import CopyAsMenu from './CopyAsMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('CopyAsMenu', () => {
  it('should render every row with its label, disabled until implemented', () => {
    // before
    renderInMenu(<CopyAsMenu />);

    // result
    ['Copy as text', 'CSS', 'CSS (all layers)', 'Copy as SVG', 'Copy as animated SVG', 'Copy as PNG'].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
  });

  it('should show the Copy as PNG shortcut', () => {
    // before
    renderInMenu(<CopyAsMenu />);

    // result
    expect(screen.getByText('⇧⌘C')).toBeInTheDocument();
  });
});
