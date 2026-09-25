import { fireEvent, render, screen } from '@testing-library/react';

// components
import EffectBlurModeToggle from './EffectBlurModeToggle';
import { TooltipProvider } from 'shared';

// types
import { EffectBlurType } from 'types/design/enums';

describe('EffectBlurModeToggle behaviors', () => {
  it('should mark the current blur mode and report a picked one', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(
      <TooltipProvider>
        <EffectBlurModeToggle blurType={EffectBlurType.uniform} onChange={onChange} />
      </TooltipProvider>,
    );

    // action
    fireEvent.click(screen.getByText('Progressive'));

    // result
    expect(screen.getByText('Uniform').closest('button')).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenCalledWith(EffectBlurType.progressive);
  });

  it('should mark no mode for a mixed blur type', () => {
    // before
    render(
      <TooltipProvider>
        <EffectBlurModeToggle onChange={vi.fn()} />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByText('Uniform').closest('button')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Progressive').closest('button')).toHaveAttribute('aria-pressed', 'false');
  });
});
