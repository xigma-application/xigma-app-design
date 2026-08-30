import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import BooleanGroupsMenu from './BooleanGroupsMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('BooleanGroupsMenu', () => {
  it('should render every row with its label and shortcut, disabled until implemented', () => {
    // before
    renderInMenu(<BooleanGroupsMenu />);

    // result
    ['Union', 'Subtract', 'Intersect', 'Exclude'].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
    expect(screen.getByText('⌥⇧U')).toBeInTheDocument();
    expect(screen.getByText('⌥⇧S')).toBeInTheDocument();
    expect(screen.getByText('⌥⇧I')).toBeInTheDocument();
    expect(screen.getByText('⌥⇧E')).toBeInTheDocument();
  });
});
