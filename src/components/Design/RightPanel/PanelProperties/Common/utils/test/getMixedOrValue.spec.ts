// utils
import { getMixedOrValue } from '../getMixedOrValue';

describe('getMixedOrValue', () => {
  it('should return the shared value when every value is equal', () => {
    // action
    const result = getMixedOrValue([4, 4, 4, 4]);

    // result
    expect(result).toBe(4);
  });

  it('should return "mixed" when the values differ', () => {
    // action
    const result = getMixedOrValue([1, 2, 1, 1]);

    // result
    expect(result).toBe('mixed');
  });

  it('should return the single value for a one-item list', () => {
    // action
    const result = getMixedOrValue([7]);

    // result
    expect(result).toBe(7);
  });
});
