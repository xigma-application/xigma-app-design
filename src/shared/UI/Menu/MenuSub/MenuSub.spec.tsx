import userEvent from '@testing-library/user-event';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

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

  it('should reveal its children a short beat after the pointer enters the sub-trigger, shorter than Radix’s own built-in hover-intent delay', () => {
    // mock
    vi.useFakeTimers();

    // before
    renderInMenu(
      <MenuSub label="Copy as">
        <MenuItem label="Copy as PNG" />
      </MenuSub>,
    );
    expect(screen.queryByText('Copy as PNG')).not.toBeInTheDocument();

    // action
    fireEvent.pointerEnter(screen.getByText('Copy as'));
    expect(screen.queryByText('Copy as PNG')).not.toBeInTheDocument();
    act(() => vi.runAllTimers());

    // result
    expect(screen.getByText('Copy as PNG')).toBeInTheDocument();

    // after
    vi.useRealTimers();
  });

  it('should cancel the pending open when the pointer leaves before the delay elapses, e.g. while just passing over the row on the way elsewhere', () => {
    // mock
    vi.useFakeTimers();

    // before
    renderInMenu(
      <MenuSub label="Copy as">
        <MenuItem label="Copy as PNG" />
      </MenuSub>,
    );

    // action
    fireEvent.pointerEnter(screen.getByText('Copy as'));
    fireEvent.pointerLeave(screen.getByText('Copy as'));
    act(() => vi.runAllTimers());

    // result
    expect(screen.queryByText('Copy as PNG')).not.toBeInTheDocument();

    // after
    vi.useRealTimers();
  });

  it('should not schedule an open on pointer enter when disabled', () => {
    // mock
    vi.useFakeTimers();

    // before
    renderInMenu(
      <MenuSub disabled label="Copy as">
        <MenuItem label="Copy as PNG" />
      </MenuSub>,
    );

    // action
    fireEvent.pointerEnter(screen.getByText('Copy as'));
    act(() => vi.runAllTimers());

    // result
    expect(screen.queryByText('Copy as PNG')).not.toBeInTheDocument();

    // after
    vi.useRealTimers();
  });

  it('should open onto an empty panel when no children are given yet', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderInMenu(<MenuSub label="Copy as" />);
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);

    // action
    await user.click(screen.getByText('Copy as'));

    // result — only the trigger itself, no items appeared inside the empty panel
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
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

  it('should apply the marginTop and marginBottom modifier classes when requested', () => {
    // before
    renderInMenu(<MenuSub label="Copy as" marginBottom marginTop />);

    // result
    expect(screen.getByRole('menuitem').className).toContain('MenuSub--marginTop');
    expect(screen.getByRole('menuitem').className).toContain('MenuSub--marginBottom');
  });

  it('should not apply the marginTop and marginBottom modifier classes by default', () => {
    // before
    renderInMenu(<MenuSub label="Copy as" />);

    // result
    expect(screen.getByRole('menuitem').className).not.toContain('MenuSub--marginTop');
    expect(screen.getByRole('menuitem').className).not.toContain('MenuSub--marginBottom');
  });

  it('should reserve an invisible check-icon gutter when withCheck is true, to align with sibling checkbox MenuItems', () => {
    // before
    renderInMenu(<MenuSub label="Copy as" withCheck />);

    // result — the check icon plus the chevron icon
    const icons = screen.getByRole('menuitem').querySelectorAll('svg');

    expect(icons).toHaveLength(2);
    expect(icons[0].parentElement).toHaveStyle({ opacity: '0' });
  });

  it('should not reserve a check-icon gutter by default', () => {
    // before
    renderInMenu(<MenuSub label="Copy as" />);

    // result — only the chevron icon
    expect(screen.getByRole('menuitem').querySelectorAll('svg')).toHaveLength(1);
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
