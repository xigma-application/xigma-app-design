// utils
import { getPaddingPairValue } from '../getPaddingPairValue';

describe('getPaddingPairValue', () => {
  it('should collapse equal sides to a single number', () => {
    expect(getPaddingPairValue(10, 10)).toBe('10');
  });

  it('should show both sides split by a comma when they differ', () => {
    expect(getPaddingPairValue(5, 2)).toBe('5, 2');
  });
});
