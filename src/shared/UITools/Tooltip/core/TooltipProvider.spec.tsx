import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// components
import Tooltip from '../Tooltip';

// core
import { TooltipProvider } from './TooltipProvider';

describe('TooltipProvider snapshots', () => {
  it('should render TooltipProvider', () => {
    // before
    const { asFragment } = render(
      <TooltipProvider>
        <span>content</span>
      </TooltipProvider>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('TooltipProvider behaviors', () => {
  it('should not show a wrapped tooltip immediately, honoring the default enter delay', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <TooltipProvider>
        <Tooltip content="Tooltip content">
          <button type="button">Hover me</button>
        </Tooltip>
      </TooltipProvider>,
    );

    // action
    await user.hover(screen.getByText('Hover me'));

    // result — the default 1000ms enter delay has not elapsed yet
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
  });

  it('should show a wrapped tooltip immediately when timeoutEnter is set to 0', async () => {
    // mock
    const user = userEvent.setup();

    // before
    render(
      <TooltipProvider timeoutEnter={0}>
        <Tooltip content="Tooltip content">
          <button type="button">Hover me</button>
        </Tooltip>
      </TooltipProvider>,
    );

    // action
    await user.hover(screen.getByText('Hover me'));

    // result
    expect(await screen.findByText('Tooltip content')).toBeInTheDocument();
  });
});
