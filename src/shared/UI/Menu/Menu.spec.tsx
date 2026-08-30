import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

// components
import Menu, { MenuCompound } from './Menu';

const { MenuItem } = MenuCompound;

describe('Menu snapshots', () => {
  it('should render Menu', () => {
    // before
    const { asFragment } = render(
      <Menu trigger={<span>Open</span>}>
        <MenuItem label="Undo" />
      </Menu>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Menu behaviors', () => {
  it('should show its content when the trigger is clicked', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <Menu trigger={<span>Open</span>}>
        <MenuItem label="Undo" />
      </Menu>,
    );

    // action
    await user.click(screen.getByText('Open'));

    // result
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('should apply a caller-supplied className to the content alongside the default styles', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <Menu className="custom-content" trigger={<span>Open</span>}>
        <MenuItem label="Undo" />
      </Menu>,
    );

    // action
    await user.click(screen.getByText('Open'));

    // result
    const content = screen.getByRole('menu');

    expect(content.className).toContain('custom-content');
    expect(content.className).toContain('Menu');
  });

  it('should notify onOpenChange when the menu opens and closes', async () => {
    // mock
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    // before
    render(
      <Menu onOpenChange={onOpenChange} trigger={<span>Open</span>}>
        <MenuItem label="Undo" />
      </Menu>,
    );

    // action
    await user.click(screen.getByText('Open'));

    // result
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    // action
    await user.keyboard('{Escape}');

    // result
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('should open at the given anchorRef position when open is controlled, with no visible/real trigger element', () => {
    // mock
    const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 0, 0) } };

    // before
    render(
      <Menu anchorRef={anchorRef} onOpenChange={vi.fn()} open>
        <MenuItem label="Undo" />
      </Menu>,
    );

    // result
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.queryByText('Open')).not.toBeInTheDocument();
  });

  it('should close when open flips to false, without the caller having clicked anything', () => {
    // mock
    const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 0, 0) } };

    // before
    const { rerender } = render(
      <Menu anchorRef={anchorRef} onOpenChange={vi.fn()} open>
        <MenuItem label="Undo" />
      </Menu>,
    );
    expect(screen.getByText('Undo')).toBeInTheDocument();

    // action
    rerender(
      <Menu anchorRef={anchorRef} onOpenChange={vi.fn()} open={false}>
        <MenuItem label="Undo" />
      </Menu>,
    );

    // result
    expect(screen.queryByText('Undo')).not.toBeInTheDocument();
  });
});
