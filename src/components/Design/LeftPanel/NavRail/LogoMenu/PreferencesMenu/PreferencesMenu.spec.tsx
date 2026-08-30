import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import PreferencesMenu from './PreferencesMenu';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('PreferencesMenu', () => {
  it('should render every row with its label, disabled until implemented', () => {
    // before
    renderInMenu(<PreferencesMenu />);

    // result
    [
      'Snap to geometry',
      'Snap to objects',
      'Snap to pixel grid',
      'Keep tool selected after use',
      'Highlight layers on hover',
      'Rename duplicated layers',
      'Show dimensions on objects',
      'Hide canvas UI during changes',
      'Use smart quotes/symbols',
      'Flip objects while resizing',
      'Keyboard zooms into selection',
      'Invert zoom direction',
      'Ctrl+click opens right click menus',
      'Use number keys for opacity',
      'Use old shortcuts for outlines',
      'Use ⌘⌥↑/↓ to rotate layers',
      'Play audio notifications in AI chat',
      'Open links in desktop app',
      'Show Agents on canvas',
      'Use scroll wheel zoom',
      'Right-click and drag to pan',
      'Color profile...',
      'Keyboard layout...',
      'Accessibility settings...',
      'Permissions and helpers...',
      'Nudge amount...',
    ].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
  });

  it('should show the Snap to pixel grid shortcut', () => {
    // before
    renderInMenu(<PreferencesMenu />);

    // result
    expect(screen.getByText("⇧⌘'")).toBeInTheDocument();
  });

  it('should leave the Theme submenu enabled', () => {
    // before
    renderInMenu(<PreferencesMenu />);

    // result
    expect(screen.getByText('Theme').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });
});
