// utils
import { clamp } from '../clamp';

describe('clamp', () => {
  it('should round a fractional value to the nearest integer', () => {
    // result
    expect(clamp(12.6)).toBe(13);
  });

  it('should floor the value up to PADDING_MIN when it goes below it', () => {
    // result
    expect(clamp(-5)).toBe(0);
  });

  it('should leave an in-range integer value untouched', () => {
    // result
    expect(clamp(10)).toBe(10);
  });
});
