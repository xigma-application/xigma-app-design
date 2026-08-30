import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import AlignmentMenu from './AlignmentMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('AlignmentMenu', () => {
  it('should render every row with its label, disabled until implemented', () => {
    // before
    renderInMenu(<AlignmentMenu />);

    // result
    [
      'Text align left',
      'Text align center',
      'Text align right',
      'Text align justified',
      'Text align top',
      'Text align middle',
      'Text align bottom',
    ].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
  });

  it('should show each shortcut', () => {
    // before
    renderInMenu(<AlignmentMenu />);

    // result
    expect(screen.getByText('⌥⌘L')).toBeInTheDocument();
    expect(screen.getByText('⌥⌘T')).toBeInTheDocument();
    expect(screen.getByText('⌥⌘R')).toBeInTheDocument();
    expect(screen.getByText('⌥⌘J')).toBeInTheDocument();
  });
});
