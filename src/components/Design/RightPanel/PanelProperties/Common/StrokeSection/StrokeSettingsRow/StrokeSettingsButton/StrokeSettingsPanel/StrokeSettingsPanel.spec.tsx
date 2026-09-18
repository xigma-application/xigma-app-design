import { fireEvent, render, screen } from '@testing-library/react';

// components
import StrokeSettingsPanel from './StrokeSettingsPanel';
import { TooltipProvider } from 'shared';

describe('StrokeSettingsPanel', () => {
  it('should render the header, the three tabs and the Basic rows, and close from the header', () => {
    // before
    const onClose = vi.fn();

    // action
    render(
      <TooltipProvider>
        <StrokeSettingsPanel onClose={onClose} />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByText('Stroke settings')).toBeInTheDocument();
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Dynamic')).toBeInTheDocument();
    expect(screen.getByText('Brush')).toBeInTheDocument();
    expect(screen.getByText('Style')).toBeInTheDocument();
    expect(screen.getByText('Width profile')).toBeInTheDocument();
    expect(screen.getByText('Join')).toBeInTheDocument();
    expect(screen.getByText('Miter angle')).toBeInTheDocument();

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should disable the flip profile button while the default Uniform profile is selected', () => {
    // action
    render(
      <TooltipProvider>
        <StrokeSettingsPanel onClose={vi.fn()} />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByLabelText('Flip width profile')).toBeDisabled();
  });

  it('should hide the Basic rows when another tab is active', () => {
    // action
    render(
      <TooltipProvider>
        <StrokeSettingsPanel onClose={vi.fn()} />
      </TooltipProvider>,
    );
    fireEvent.click(screen.getByText('Brush'));

    // result
    expect(screen.queryByText('Width profile')).not.toBeInTheDocument();
  });
});
