import { render, screen } from '@testing-library/react';

// components
import { ColumnAlignmentLayoutButtonIcons } from '../ColumnAlignmentLayoutButtonIcons';
import { TooltipProvider } from 'shared';

describe('ColumnAlignmentLayoutButtonIcons', () => {
  it('should return exactly one button icon element', () => {
    // action
    const buttonsIcon = ColumnAlignmentLayoutButtonIcons();

    // result
    expect(buttonsIcon).toHaveLength(1);
  });

  it('should render the auto layout settings trigger', () => {
    // before
    render(<TooltipProvider>{ColumnAlignmentLayoutButtonIcons()}</TooltipProvider>);

    // result
    expect(screen.getByLabelText('Properties')).toBeInTheDocument();
  });
});
