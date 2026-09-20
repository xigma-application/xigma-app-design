// utils
import { getEffectBlurRadius } from '../getEffectBlurRadius';

describe('getEffectBlurRadius', () => {
  it('should keep blur values inside the supported range', () => {
    expect(getEffectBlurRadius(4)).toBe(4);
    expect(getEffectBlurRadius(-3)).toBe(0);
    expect(getEffectBlurRadius(500)).toBe(32);
  });
});
