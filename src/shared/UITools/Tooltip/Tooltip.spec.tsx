import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// components
import Tooltip from './Tooltip';

// core
import { TooltipProvider } from './core/TooltipProvider';

describe('Tooltip snapshots', () => {
  it('should render Tooltip', () => {
    // before
    const { asFragment } = render(
      <TooltipProvider>
        <Tooltip content="Tooltip content">
          <button type="button">Hover me</button>
        </Tooltip>
      </TooltipProvider>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Tooltip behaviors', () => {
  it('should show its content after hovering the trigger', async () => {
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

  it('should hide its content once the pointer leaves the trigger', async () => {
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
    await screen.findByText('Tooltip content');
    await user.unhover(screen.getByText('Hover me'));

    // result
    await waitFor(() => expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument());
  });

  it('should render just the trigger, with no tooltip machinery, when no content is given', () => {
    // before
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <button type="button">Hover me</button>
        </Tooltip>
      </TooltipProvider>,
    );

    // result
    expect(container.querySelector('button')).not.toHaveAttribute('data-state');
  });
});
