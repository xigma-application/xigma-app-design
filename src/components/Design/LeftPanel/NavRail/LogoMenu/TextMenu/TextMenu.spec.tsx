import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import TextMenu from './TextMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('TextMenu', () => {
  it('should render every row with its label', () => {
    // before
    renderInMenu(<TextMenu />);

    // result
    [
      'Bold',
      'Italic',
      'Underline',
      'Strikethrough',
      'Create link',
      'Bulleted list',
      'Numbered list',
      'Alignment',
      'Adjust',
      'Case',
      'Text direction',
      'Spell check',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should show each shortcut', () => {
    // before
    renderInMenu(<TextMenu />);

    // result
    expect(screen.getByText('⌘B')).toBeInTheDocument();
    expect(screen.getByText('⌘I')).toBeInTheDocument();
    expect(screen.getByText('⌘U')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘X')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘U')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘8')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘7')).toBeInTheDocument();
  });

  it('should disable every flat row but leave the nested submenus enabled', () => {
    // before
    renderInMenu(<TextMenu />);

    // result
    expect(screen.getByText('Bold').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Alignment').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Adjust').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Case').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Text direction').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Spell check').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });
});
