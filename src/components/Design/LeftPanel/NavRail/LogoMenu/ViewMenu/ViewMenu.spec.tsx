import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import ViewMenu from './ViewMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('ViewMenu', () => {
  it('should render every row with its label', () => {
    // before
    renderInMenu(<ViewMenu />);

    // result
    [
      'Pixel grid',
      'Layout guides',
      'Rulers',
      'Show slices',
      'Comments',
      'Annotations',
      'Outlines',
      'Pixel preview',
      'Mask outlines',
      'Frame outlines',
      'Memory usage',
      'Additional labels',
      'Minimize UI',
      'Show/Hide UI',
      'Multiplayer cursors',
      'Switch to Draw',
      'Switch to Dev Mode',
      'Panels',
      'Zoom in',
      'Zoom out',
      'Zoom to 100%',
      'Zoom to fit',
      'Zoom to selection',
      'Previous page',
      'Next page',
      'Zoom to previous frame',
      'Zoom to next frame',
      'Find previous frame',
      'Find next frame',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should show the globe-icon shortcuts for the page navigation rows verbatim, since they have no key-modifier equivalent', () => {
    // before
    renderInMenu(<ViewMenu />);

    // result
    expect(screen.getByText('🌐↑')).toBeInTheDocument();
    expect(screen.getByText('🌐↓')).toBeInTheDocument();
  });

  it('should leave the Outlines and Panels submenus enabled while every flat row stays disabled', () => {
    // before
    renderInMenu(<ViewMenu />);

    // result
    expect(screen.getByText('Pixel grid').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Outlines').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Panels').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });
});
