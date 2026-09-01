// utils
import { isRangeInside } from '../isRangeInside';

describe('isRangeInside', () => {
  it('should report true when the inner range sits fully within the outer range', () => {
    expect(isRangeInside(0, 100, 20, 80)).toBe(true);
  });

  it('should report true for two identical ranges', () => {
    expect(isRangeInside(0, 100, 0, 100)).toBe(true);
  });

  it('should report false when the inner range pokes past either end', () => {
    expect(isRangeInside(0, 100, 20, 120)).toBe(false);
    expect(isRangeInside(0, 100, -20, 80)).toBe(false);
  });

  it('should report false for two ranges that merely overlap partially', () => {
    expect(isRangeInside(0, 100, 50, 150)).toBe(false);
  });
});
