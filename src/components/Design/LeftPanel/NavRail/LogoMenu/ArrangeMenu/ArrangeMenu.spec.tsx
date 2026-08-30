import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import ArrangeMenu from './ArrangeMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('ArrangeMenu', () => {
  it('should render every row with its label, disabled until implemented', () => {
    // before
    renderInMenu(<ArrangeMenu />);

    // result
    [
      'Round to pixel',
      'Align left',
      'Align horizontal centers',
      'Align right',
      'Align top',
      'Align vertical centers',
      'Align bottom',
      'Tidy up',
      'Pack horizontal',
      'Pack vertical',
      'Distribute horizontal spacing',
      'Distribute vertical spacing',
      'Distribute left',
      'Distribute horizontal centers',
      'Distribute right',
      'Distribute top',
      'Distribute vertical centers',
      'Distribute bottom',
    ].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
  });

  it('should show each shortcut', () => {
    // before
    renderInMenu(<ArrangeMenu />);

    // result
    expect(screen.getByText('⌥A')).toBeInTheDocument();
    expect(screen.getByText('⌥H')).toBeInTheDocument();
    expect(screen.getByText('⌥D')).toBeInTheDocument();
    expect(screen.getByText('⌥W')).toBeInTheDocument();
    expect(screen.getByText('⌥V')).toBeInTheDocument();
    expect(screen.getByText('⌥S')).toBeInTheDocument();
    expect(screen.getByText('⌃⌥T')).toBeInTheDocument();
    expect(screen.getByText('⌃⌥H')).toBeInTheDocument();
    expect(screen.getByText('⌃⌥V')).toBeInTheDocument();
  });
});
