// types
import { TEffect } from 'types/design/types';

// utils
import { getEffectBlurAmount } from '../getEffectBlurAmount';

vi.mock('utils/design/effects/isProgressiveBlur', () => ({
  isProgressiveBlur: (effect: { progressive?: boolean }): boolean => Boolean(effect.progressive),
}));
vi.mock('utils/design/effects/getProgressiveBlur', () => ({ getProgressiveBlur: (): unknown => ({ endBlur: 12, startBlur: 4 }) }));

describe('getEffectBlurAmount', () => {
  it('should use the stronger end of a progressive blur', () => {
    // result
    expect(getEffectBlurAmount({ progressive: true } as unknown as TEffect)).toBe(12);
  });

  it('should use the blur of a plain effect, and zero without one', () => {
    // result
    expect(getEffectBlurAmount({ blur: 6 } as TEffect)).toBe(6);
    expect(getEffectBlurAmount({} as TEffect)).toBe(0);
    expect(getEffectBlurAmount(undefined)).toBe(0);
  });
});
