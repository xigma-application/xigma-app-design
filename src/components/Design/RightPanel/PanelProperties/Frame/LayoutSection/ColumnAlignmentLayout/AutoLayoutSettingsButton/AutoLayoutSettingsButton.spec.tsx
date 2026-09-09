import { fireEvent, render, screen } from '@testing-library/react';

// components
import AutoLayoutSettingsButton from './AutoLayoutSettingsButton';
import { TooltipProvider } from 'shared';

const renderButton = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <AutoLayoutSettingsButton />
    </TooltipProvider>,
  );

describe('AutoLayoutSettingsButton snapshots', () => {
  it('should render the trigger with the settings popover closed', () => {
    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('AutoLayoutSettingsButton behaviors', () => {
  it('should open the auto layout settings popover when the trigger is clicked', () => {
    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Properties'));

    // result
    expect(screen.getByText('Auto layout settings')).toBeInTheDocument();
  });

  it('should close the popover when the header close button is clicked', () => {
    // before
    renderButton();
    fireEvent.click(screen.getByLabelText('Properties'));

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(screen.queryByText('Auto layout settings')).not.toBeInTheDocument();
  });
});
