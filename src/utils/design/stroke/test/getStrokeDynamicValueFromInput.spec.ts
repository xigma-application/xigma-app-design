// utils
import { getStrokeDynamicValueFromInput } from '../getStrokeDynamicValueFromInput';

describe('getStrokeDynamicValueFromInput', () => {
  it('should read a percentage and round it to two decimals', () => {
    expect(getStrokeDynamicValueFromInput('75%', 1, 2000)).toBe(75);
    expect(getStrokeDynamicValueFromInput(' 12.345 ', 0)).toBe(12.35);
  });

  it('should clamp to the min and max', () => {
    expect(getStrokeDynamicValueFromInput('0', 1, 2000)).toBe(1);
    expect(getStrokeDynamicValueFromInput('5000%', 1, 2000)).toBe(2000);
    expect(getStrokeDynamicValueFromInput('60000%', 0)).toBe(60000);
  });

  it('should reject text that is not a number', () => {
    expect(getStrokeDynamicValueFromInput('', 0)).toBeUndefined();
    expect(getStrokeDynamicValueFromInput('abc', 0)).toBeUndefined();
  });
});
