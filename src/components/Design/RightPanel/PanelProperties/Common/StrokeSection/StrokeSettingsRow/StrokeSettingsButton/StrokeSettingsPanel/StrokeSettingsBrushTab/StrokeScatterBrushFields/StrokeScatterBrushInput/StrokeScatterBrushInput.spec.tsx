import { render, screen } from '@testing-library/react';

// components
import StrokeScatterBrushInput from './StrokeScatterBrushInput';
import { TooltipProvider } from 'shared';

describe('StrokeScatterBrushInput behaviors', () => {
  it('should render the text field with the given props', () => {
    // before
    render(
      <TooltipProvider>
        <StrokeScatterBrushInput aria-label="Size" defaultValue="10%" tooltip="Size" />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByLabelText('Size')).toHaveValue('10%');
  });
});
