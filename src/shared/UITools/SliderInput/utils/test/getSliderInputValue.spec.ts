// utils
import { getSliderInputValue } from '../getSliderInputValue';

describe('getSliderInputValue', () => {
  it('should clamp a typed number into the range and round it to two decimals', () => {
    // result
    expect(getSliderInputValue(' 42.678 ', 0, 100)).toBe(42.68);
    expect(getSliderInputValue('250', 0, 100)).toBe(100);
    expect(getSliderInputValue('-5', 0, 100)).toBe(0);
  });

  it('should ignore an input that is not a number', () => {
    // result
    expect(getSliderInputValue('', 0, 100)).toBeUndefined();
    expect(getSliderInputValue('abc', 0, 100)).toBeUndefined();
  });
});
