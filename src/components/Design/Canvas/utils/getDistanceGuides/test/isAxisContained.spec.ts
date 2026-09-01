// utils
import { isAxisContained } from '../isAxisContained';

describe('isAxisContained', () => {
  it('should report true when the first range contains the second', () => {
    expect(isAxisContained(0, 100, 20, 80)).toBe(true);
  });

  it('should report true when the second range contains the first', () => {
    expect(isAxisContained(20, 80, 0, 100)).toBe(true);
  });

  it('should report false for a genuine partial overlap where neither contains the other', () => {
    expect(isAxisContained(0, 100, 50, 150)).toBe(false);
  });

  it('should report false when the ranges do not overlap at all', () => {
    expect(isAxisContained(0, 100, 200, 300)).toBe(false);
  });
});
