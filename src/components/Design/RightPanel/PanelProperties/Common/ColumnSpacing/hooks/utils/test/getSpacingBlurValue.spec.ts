// utils
import { getSpacingBlurValue } from '../getSpacingBlurValue';

describe('getSpacingBlurValue', () => {
  it('should parse a finite number', () => {
    // result
    expect(getSpacingBlurValue(' 12.5 ')).toBe(12.5);
    expect(getSpacingBlurValue('-4')).toBe(-4);
  });

  it('should reject empty or non-numeric input', () => {
    // result
    expect(getSpacingBlurValue('  ')).toBeNull();
    expect(getSpacingBlurValue('abc')).toBeNull();
  });
});
