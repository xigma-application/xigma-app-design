// utils
import { getEffectNumberFromInput } from '../getEffectNumberFromInput';

describe('getEffectNumberFromInput', () => {
  it('should parse numbers, including negative ones, rounded to two decimals', () => {
    expect(getEffectNumberFromInput('4')).toBe(4);
    expect(getEffectNumberFromInput(' -3.456 ')).toBe(-3.46);
  });

  it('should clamp to the minimum', () => {
    expect(getEffectNumberFromInput('-5', 0)).toBe(0);
  });

  it('should return undefined for empty or non-numeric input', () => {
    expect(getEffectNumberFromInput('')).toBeUndefined();
    expect(getEffectNumberFromInput('abc')).toBeUndefined();
  });
});
