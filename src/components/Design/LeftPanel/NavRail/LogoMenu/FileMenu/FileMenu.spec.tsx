import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import FileMenu from './FileMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('FileMenu', () => {
  it('should render every row with its label and shortcut', () => {
    // before
    renderInMenu(<FileMenu />);

    // result
    expect(screen.getByText('New Design')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Place image...')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘K')).toBeInTheDocument();
    expect(screen.getByText('Save local copy...')).toBeInTheDocument();
    expect(screen.getByText('Save to version history...')).toBeInTheDocument();
    expect(screen.getByText('⌥⌘S')).toBeInTheDocument();
    expect(screen.getByText('Show version history')).toBeInTheDocument();
    expect(screen.getByText('Export...')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘E')).toBeInTheDocument();
    expect(screen.getByText('Export frames to PDF...')).toBeInTheDocument();
    expect(screen.getByText('Create branch...')).toBeInTheDocument();
  });

  it('should disable every not-yet-implemented flat item but leave the New submenu enabled', () => {
    // before
    renderInMenu(<FileMenu />);

    // result
    expect(screen.getByText('New Design').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Create branch...').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('New').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });
});
