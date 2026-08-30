import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import AdjustMenu from './AdjustMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('AdjustMenu', () => {
  it('should render every row with its label, disabled until implemented', () => {
    // before
    renderInMenu(<AdjustMenu />);

    // result
    [
      'Increase indentation',
      'Decrease indentation',
      'Increase font size',
      'Decrease font size',
      'Increase font weight',
      'Decrease font weight',
      'Increase line height',
      'Decrease line height',
      'Increase letter spacing',
      'Decrease letter spacing',
    ].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
  });

  it('should show each shortcut', () => {
    // before
    renderInMenu(<AdjustMenu />);

    // result
    expect(screen.getByText('⌘]')).toBeInTheDocument();
    expect(screen.getByText('⌘[')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘>')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘<')).toBeInTheDocument();
    expect(screen.getByText('⌥⌘>')).toBeInTheDocument();
    expect(screen.getByText('⌥⌘<')).toBeInTheDocument();
    expect(screen.getByText('⌥⇧>')).toBeInTheDocument();
    expect(screen.getByText('⌥⇧<')).toBeInTheDocument();
    expect(screen.getByText('⌥>')).toBeInTheDocument();
    expect(screen.getByText('⌥<')).toBeInTheDocument();
  });
});
