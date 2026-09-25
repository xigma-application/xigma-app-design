import { fireEvent, render, screen } from '@testing-library/react';

// components
import OpacityField from './OpacityField';
import { TooltipProvider } from 'shared';

describe('OpacityField behaviors', () => {
  it('should show the opacity and report the blur', () => {
    // mock
    const onBlur = vi.fn();

    // before
    render(
      <TooltipProvider>
        <OpacityField displayValue="40%" onBlur={onBlur} onScrub={vi.fn()} value={40} />
      </TooltipProvider>,
    );

    // find
    const input = screen.getByDisplayValue('40%');

    // action
    fireEvent.blur(input);

    // result
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
