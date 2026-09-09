import { fireEvent, render, screen } from '@testing-library/react';

// components
import PopoverAutoLayoutSettingsHeader from './PopoverAutoLayoutSettingsHeader';
import { TooltipProvider } from 'shared';

describe('PopoverAutoLayoutSettingsHeader', () => {
  it('should render the title', () => {
    // before
    render(
      <TooltipProvider>
        <PopoverAutoLayoutSettingsHeader onClose={vi.fn()} />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByText('Auto layout settings')).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', () => {
    // mock
    const onClose = vi.fn();

    // before
    render(
      <TooltipProvider>
        <PopoverAutoLayoutSettingsHeader onClose={onClose} />
      </TooltipProvider>,
    );

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
