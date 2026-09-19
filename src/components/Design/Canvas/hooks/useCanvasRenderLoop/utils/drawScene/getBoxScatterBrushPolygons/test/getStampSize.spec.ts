// utils
import { getStampSize } from '../getStampSize';

describe('getStampSize', () => {
  it('should be the stroke width times the profile multiplier without a jitter', () => {
    // result
    expect(getStampSize(10, 0, 1, () => 0.9)).toBe(10);
    expect(getStampSize(10, 0, 0.5, () => 0.9)).toBe(5);
  });

  it('should scale by about 0.4-1.6x at 100% jitter and never below 0.2x', () => {
    // result
    expect(getStampSize(10, 100, 1, () => 0)).toBeCloseTo(4);
    expect(getStampSize(10, 100, 1, () => 1)).toBeCloseTo(16);
    expect(getStampSize(10, 1000, 1, () => 0)).toBe(2);
  });
});
