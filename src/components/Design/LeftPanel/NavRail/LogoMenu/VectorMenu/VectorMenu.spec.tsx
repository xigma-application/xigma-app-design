import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import VectorMenu from './VectorMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('VectorMenu', () => {
  it('should render every row with its label, disabled until implemented', () => {
    // before
    renderInMenu(<VectorMenu />);

    // result
    ['Join selection', 'Smooth join selection', 'Delete and heal selection', 'Split vector', 'Simplify vector', 'Offset vector'].forEach(
      (label) => {
        expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
      },
    );
  });

  it('should show each shortcut', () => {
    // before
    renderInMenu(<VectorMenu />);

    // result
    expect(screen.getByText('⌘J')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘J')).toBeInTheDocument();
    expect(screen.getByText('⇧⌫')).toBeInTheDocument();
  });
});
