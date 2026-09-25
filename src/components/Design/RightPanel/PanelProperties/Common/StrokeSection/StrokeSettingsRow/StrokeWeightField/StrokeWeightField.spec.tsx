import { fireEvent, render, screen } from '@testing-library/react';

// components
import StrokeWeightField from './StrokeWeightField';
import { TooltipProvider } from 'shared';

describe('StrokeWeightField behaviors', () => {
  it('should show the weight and report the blur', () => {
    // mock
    const onBlur = vi.fn();

    // before
    render(
      <TooltipProvider>
        <StrokeWeightField
          ariaLabel="Stroke weight"
          displayValue="2"
          onBlur={onBlur}
          onDragEnd={vi.fn()}
          onDragStart={vi.fn()}
          onScrub={vi.fn()}
          scrubValue={2}
        />
      </TooltipProvider>,
    );

    // find
    const input = screen.getByLabelText('Stroke weight');

    // action
    fireEvent.blur(input);

    // result
    expect(input).toHaveValue('2');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
