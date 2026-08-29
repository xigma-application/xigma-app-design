// utils
import { getRevertValue } from '../getRevertValue';

describe('getRevertValue', () => {
  it('should return the min value when the value sits at max', () => {
    // result
    expect(getRevertValue(0, 100, -100, 100)).toBe(-100);
  });

  it('should return the max value when the value sits at min', () => {
    // result
    expect(getRevertValue(0, 100, -100, -100)).toBe(100);
  });

  it('should return the default value otherwise', () => {
    // result
    expect(getRevertValue(51, 100, -100, 50)).toBe(51);
  });
});
