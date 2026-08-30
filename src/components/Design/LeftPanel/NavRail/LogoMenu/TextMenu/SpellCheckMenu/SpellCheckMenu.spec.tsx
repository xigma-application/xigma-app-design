import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import SpellCheckMenu from './SpellCheckMenu';

// others
import { SPELL_CHECK_LANGUAGES } from './constants';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('SpellCheckMenu', () => {
  it('should render the Check spelling and Auto-detect language rows, disabled until implemented', () => {
    // before
    renderInMenu(<SpellCheckMenu />);

    // result
    expect(screen.getByText('Check spelling').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Auto-detect language').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should render every language from the SPELL_CHECK_LANGUAGES list', () => {
    // before
    renderInMenu(<SpellCheckMenu />);

    // result
    SPELL_CHECK_LANGUAGES.forEach((language) => {
      expect(screen.getByText(language)).toBeInTheDocument();
    });
  });
});
