import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import EditMenu from './EditMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('EditMenu', () => {
  it('should render every row with its label and shortcut', () => {
    // before
    renderInMenu(<EditMenu />);

    // result
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('⌘Z')).toBeInTheDocument();
    expect(screen.getByText('Redo')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘Z')).toBeInTheDocument();
    expect(screen.getByText('Copy as')).toBeInTheDocument();
    expect(screen.getByText('Paste over selection')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘V')).toBeInTheDocument();
    expect(screen.getByText('Paste to replace')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘R')).toBeInTheDocument();
    expect(screen.getByText('Duplicate')).toBeInTheDocument();
    expect(screen.getByText('⌘D')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('⌫')).toBeInTheDocument();
    expect(screen.getByText('Find')).toBeInTheDocument();
    expect(screen.getByText('⌘F')).toBeInTheDocument();
    expect(screen.getByText('Find next')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘F')).toBeInTheDocument();
    expect(screen.getByText('Find previous')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘D')).toBeInTheDocument();
    expect(screen.getByText('Find and replace...')).toBeInTheDocument();
    expect(screen.getByText('Set default properties')).toBeInTheDocument();
    expect(screen.getByText('Copy properties')).toBeInTheDocument();
    expect(screen.getByText('⌥⌘C')).toBeInTheDocument();
    expect(screen.getByText('Paste properties')).toBeInTheDocument();
    expect(screen.getByText('⌥⌘V')).toBeInTheDocument();
    expect(screen.getByText('Pick color')).toBeInTheDocument();
    expect(screen.getByText('⌃C')).toBeInTheDocument();
    expect(screen.getByText('Select all')).toBeInTheDocument();
    expect(screen.getByText('⌘A')).toBeInTheDocument();
    expect(screen.getByText('Select matching layers')).toBeInTheDocument();
    expect(screen.getByText('⌥⌘A')).toBeInTheDocument();
    expect(screen.getByText('Select none')).toBeInTheDocument();
    expect(screen.getByText('↺')).toBeInTheDocument();
    expect(screen.getByText('Select inverse')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘A')).toBeInTheDocument();
    expect(screen.getByText('Select all with')).toBeInTheDocument();
  });

  it('should disable every flat item but leave the Copy as and Select all with submenus enabled', () => {
    // before
    renderInMenu(<EditMenu />);

    // result
    expect(screen.getByText('Undo').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Select all').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Copy as').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Select all with').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });
});
