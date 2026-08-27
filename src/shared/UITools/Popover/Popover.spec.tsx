import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// components
import Popover from './Popover';

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
});
