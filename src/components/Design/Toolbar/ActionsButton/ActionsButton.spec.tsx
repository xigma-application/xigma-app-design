import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

// components
import ActionsButton from './ActionsButton';
import { TooltipProvider } from 'shared';

const renderActionsButton = (timeoutEnter?: number): ReturnType<typeof render> =>
  render(
    <TooltipProvider timeoutEnter={timeoutEnter}>
      <ActionsButton />
    </TooltipProvider>,
  );

describe('ActionsButton', () => {
  it('should render as a labeled button', () => {
    // before
    renderActionsButton();

    // result
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument();
  });

  it('should show the label and its keyboard shortcut in a tooltip on hover', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderActionsButton(0);

    // action
    await user.hover(screen.getByRole('button', { name: 'Actions' }));

    // result
    expect(await screen.findByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });
});
