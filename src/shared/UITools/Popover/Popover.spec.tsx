import { render, screen } from '@testing-library/react';
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
});
