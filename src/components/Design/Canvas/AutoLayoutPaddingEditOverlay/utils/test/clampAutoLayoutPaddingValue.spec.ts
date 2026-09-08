// utils
import { clampAutoLayoutPaddingValue } from '../clampAutoLayoutPaddingValue';

describe('clampAutoLayoutPaddingValue', () => {
  it('should round a fractional value', () => {
    expect(clampAutoLayoutPaddingValue(12.6)).toBe(13);
  });

  it('should clamp a negative value to 0', () => {
    expect(clampAutoLayoutPaddingValue(-10)).toBe(0);
  });

  it('should keep a positive value unchanged', () => {
    expect(clampAutoLayoutPaddingValue(40)).toBe(40);
  });
});
