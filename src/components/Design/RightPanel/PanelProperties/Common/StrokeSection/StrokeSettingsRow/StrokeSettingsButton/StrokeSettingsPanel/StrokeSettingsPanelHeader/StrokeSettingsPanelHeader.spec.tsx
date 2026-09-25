import { fireEvent, render, screen } from '@testing-library/react';

// components
import StrokeSettingsPanelHeader from './StrokeSettingsPanelHeader';
import { TooltipProvider } from 'shared';

describe('StrokeSettingsPanelHeader behaviors', () => {
  it('should show the default title and close from its button', () => {
    // mock
    const onClose = vi.fn();

    // before
    render(
      <TooltipProvider>
        <StrokeSettingsPanelHeader onClose={onClose} />
      </TooltipProvider>,
    );

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(screen.getByText('Stroke settings')).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should show a given title', () => {
    // before
    render(
      <TooltipProvider>
        <StrokeSettingsPanelHeader onClose={vi.fn()} title="Brush" />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByText('Brush')).toBeInTheDocument();
  });
});
