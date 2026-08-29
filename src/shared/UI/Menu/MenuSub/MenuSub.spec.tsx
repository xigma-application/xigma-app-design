import userEvent from '@testing-library/user-event';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import MenuSub from './MenuSub';
import MenuItem from '../MenuItem/MenuItem';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <DropdownMenuPrimitive.Root open>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>,
  );

describe('MenuSub snapshots', () => {
  it('should render a MenuSub trigger', () => {
    // before
    renderInMenu(
      <MenuSub icon="FrameTool" label="Copy as">
        <MenuItem label="Copy as PNG" />
      </MenuSub>,
    );

    // result
    expect(screen.getByRole('menuitem')).toMatchSnapshot();
  });
});

describe('MenuSub behaviors', () => {
  it('should reveal its children when the sub-trigger is clicked', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderInMenu(
      <MenuSub label="Copy as">
        <MenuItem label="Copy as PNG" />
      </MenuSub>,
    );

    // result — collapsed
    expect(screen.queryByText('Copy as PNG')).not.toBeInTheDocument();

    // action
    await user.click(screen.getByText('Copy as'));

    // result
    expect(screen.getByText('Copy as PNG')).toBeInTheDocument();
  });

  it('should not open when disabled', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderInMenu(
      <MenuSub disabled label="Copy as">
        <MenuItem label="Copy as PNG" />
      </MenuSub>,
    );

    // action
    await user.click(screen.getByText('Copy as'));

    // result
    expect(screen.queryByText('Copy as PNG')).not.toBeInTheDocument();
  });

  it('should merge caller-supplied classNames onto the trigger and the sub-panel', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderInMenu(
      <MenuSub className="custom-panel" label="Copy as" triggerClassName="custom-trigger">
        <MenuItem label="Copy as PNG" />
      </MenuSub>,
    );

    // result — trigger
    const trigger = screen.getByText('Copy as').closest('[role="menuitem"]');

    expect(trigger?.className).toContain('custom-trigger');
    expect(trigger?.className).toContain('MenuSub');

    // action
    await user.click(screen.getByText('Copy as'));

    // result — panel
    const panel = screen.getByText('Copy as PNG').closest('[role="menu"]');

    expect(panel?.className).toContain('custom-panel');
    expect(panel?.className).toContain('Menu');
  });
});
