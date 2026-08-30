import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import ObjectMenu from './ObjectMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('ObjectMenu', () => {
  it('should render every row with its label', () => {
    // before
    renderInMenu(<ObjectMenu />);

    // result
    [
      'Frame selection',
      'Group selection',
      'Ungroup selection',
      'Wrap in new section',
      'Convert to section',
      'Convert to frame',
      'Use as mask',
      'Set as thumbnail',
      'Add auto layout',
      'More layout options',
      'Create component',
      'Slots',
      'Reset instance',
      'Detach instance',
      'Main component',
      'Bring to front',
      'Bring forward',
      'Send backward',
      'Send to back',
      'Flip horizontal',
      'Flip vertical',
      'Rotate 180°',
      'Rotate 90° left',
      'Rotate 90° right',
      'Flatten',
      'Outline stroke',
      'Boolean groups',
      'Show/Hide selection',
      'Lock/Unlock selection',
      'Hide other layers',
      'Collapse layers',
      'Remove fill',
      'Remove stroke',
      'Swap fill and stroke',
      'Remove interactions',
      'Delete contents',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should show the Use as mask shortcut', () => {
    // before
    renderInMenu(<ObjectMenu />);

    // result
    expect(screen.getByText('⌃⌘M')).toBeInTheDocument();
  });

  it('should disable every flat row but leave the nested submenus enabled', () => {
    // before
    renderInMenu(<ObjectMenu />);

    // result
    expect(screen.getByText('Frame selection').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('More layout options').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Slots').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Main component').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Boolean groups').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });
});
