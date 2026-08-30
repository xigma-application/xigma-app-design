import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import SelectAllWithMenu from './SelectAllWithMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('SelectAllWithMenu', () => {
  it('should render every row with its label, disabled until implemented', () => {
    // before
    renderInMenu(<SelectAllWithMenu />);

    // result
    [
      'Select all with same properties',
      'Select all with same fill',
      'Select all with same stroke',
      'Select all with same effect',
      'Select all with same text properties',
      'Select all with same font',
      'Select all with same instance',
      'Select all with same variant',
    ].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
  });
});
