import { fireEvent, render, screen } from '@testing-library/react';

// components
import EffectNoiseTypeToggle from './EffectNoiseTypeToggle';
import { TooltipProvider } from 'shared';

// types
import { EffectNoiseType } from 'types/design/enums';

describe('EffectNoiseTypeToggle behaviors', () => {
  it('should list mono, duo and multi, mark the current one and report a picked one', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(
      <TooltipProvider>
        <EffectNoiseTypeToggle noiseType={EffectNoiseType.mono} onChange={onChange} />
      </TooltipProvider>,
    );

    // action
    fireEvent.click(screen.getByText('Multi'));

    // result
    expect(screen.getByText('Mono').closest('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Duo')).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(EffectNoiseType.multi);
  });

  it('should mark no type for a mixed noise type', () => {
    // before
    render(
      <TooltipProvider>
        <EffectNoiseTypeToggle onChange={vi.fn()} />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByText('Mono').closest('button')).toHaveAttribute('aria-pressed', 'false');
  });
});
