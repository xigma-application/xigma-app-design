import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// components
import Popover from './Popover';
import { TooltipProvider } from 'shared';

describe('Popover snapshots', () => {
  it('should render Popover', () => {
    // before
    const { asFragment } = render(<Popover trigger={<span>Open</span>}>Content</Popover>);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Popover behaviors', () => {
  it('should show its content when the trigger is clicked', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(<Popover trigger={<span>Open</span>}>Popover content</Popover>);

    // action
    await user.click(screen.getByText('Open'));

    // result
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('should apply a caller-supplied className to the content alongside the default styles', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <Popover className="custom-content" trigger={<span>Open</span>}>
        Popover content
      </Popover>,
    );

    // action
    await user.click(screen.getByText('Open'));

    // result
    const content = screen.getByText('Popover content');

    expect(content.className).toContain('custom-content');
    expect(content.className).toContain('Popover');
  });

  it('should drag the content by its transform when moveable', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <Popover moveable trigger={<span>Open</span>}>
        Popover content
      </Popover>,
    );
    await user.click(screen.getByText('Open'));
    const content = screen.getByRole('dialog');

    // result — no drag yet
    expect(content).not.toHaveStyle({ transform: expect.stringContaining('30px') });

    // action
    fireEvent.pointerDown(content, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(content, { buttons: 1, clientX: 130, clientY: 90 });

    // result
    expect(content).toHaveStyle({ transform: 'translate(30px, -10px)' });
  });

  it('should render as open when a controlled open prop is true, without needing a trigger click', () => {
    // before
    render(
      <Popover open trigger={<span>Open</span>}>
        Popover content
      </Popover>,
    );

    // result
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('should not add drag handlers or a transform when not moveable', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(<Popover trigger={<span>Open</span>}>Popover content</Popover>);
    await user.click(screen.getByText('Open'));
    const content = screen.getByRole('dialog');

    // action
    fireEvent.pointerDown(content, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(content, { buttons: 1, clientX: 130, clientY: 90 });

    // result
    expect(content.style.transform).toBe('');
  });

  it('should render the trigger element itself, without an extra wrapping button, when asChild is set', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <Popover
        asChild
        trigger={
          <button aria-label="Open" type="button">
            Open
          </button>
        }
      >
        Popover content
      </Popover>,
    );

    // result — the passed-in button IS the trigger, not a button wrapped around another button
    expect(screen.getAllByRole('button', { name: 'Open' })).toHaveLength(1);

    // action
    await user.click(screen.getByRole('button', { name: 'Open' }));

    // result
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('should not render the trigger tooltip content until the trigger is hovered', () => {
    // before
    render(
      <TooltipProvider>
        <Popover trigger={<span>Open</span>} triggerTooltip="Trigger tooltip">
          Popover content
        </Popover>
      </TooltipProvider>,
    );

    // result
    expect(screen.queryByText('Trigger tooltip')).not.toBeInTheDocument();
  });

  it('should wrap its children in a PopoverScrollArea when scrollable', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <Popover scrollable trigger={<span>Open</span>}>
        Popover content
      </Popover>,
    );
    await user.click(screen.getByText('Open'));
    const content = screen.getByRole('dialog');

    // result
    expect(content.className).toContain('Popover--scrollable');
    expect(content.querySelector('[class*="PopoverScrollArea__content"]')).not.toBeNull();
  });
});
