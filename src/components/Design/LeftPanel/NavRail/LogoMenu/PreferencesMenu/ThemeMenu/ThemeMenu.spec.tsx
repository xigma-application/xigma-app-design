import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import ThemeMenu from './ThemeMenu';

// others
import { STORAGE_KEY } from 'hooks/useTheme/constants';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('ThemeMenu', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should render every row with its label, all enabled', () => {
    // before
    renderInMenu(<ThemeMenu />);

    // result
    ['Light', 'Dark', 'System theme'].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    });
  });

  it('should switch to light on Light click', () => {
    // mock
    localStorage.setItem(STORAGE_KEY, 'dark');

    // before
    renderInMenu(<ThemeMenu />);

    // action
    fireEvent.click(screen.getByText('Light'));

    // result
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('should switch to dark on Dark click', () => {
    // mock
    localStorage.setItem(STORAGE_KEY, 'light');

    // before
    renderInMenu(<ThemeMenu />);

    // action
    fireEvent.click(screen.getByText('Dark'));

    // result
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('should switch to the system theme on System theme click', () => {
    // mock
    localStorage.setItem(STORAGE_KEY, 'dark');

    // before
    renderInMenu(<ThemeMenu />);

    // action
    fireEvent.click(screen.getByText('System theme'));

    // result
    expect(document.documentElement.dataset.theme).toBe('system');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('system');
  });
});
