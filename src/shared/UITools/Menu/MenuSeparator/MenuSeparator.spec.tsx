import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import MenuSeparator from './MenuSeparator';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('MenuSeparator snapshots', () => {
  it('should render MenuSeparator', () => {
    // before
    renderInMenu(<MenuSeparator />);

    // result
    expect(screen.getByRole('separator')).toMatchSnapshot();
  });
});

describe('MenuSeparator behaviors', () => {
  it('should merge a caller-supplied className onto the default styles', () => {
    // before
    renderInMenu(<MenuSeparator className="custom-separator" />);

    // result
    const separator = screen.getByRole('separator');

    expect(separator.className).toContain('custom-separator');
    expect(separator.className).toContain('MenuSeparator');
  });
});
