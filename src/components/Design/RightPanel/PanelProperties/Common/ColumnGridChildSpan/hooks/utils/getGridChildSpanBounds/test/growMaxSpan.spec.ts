// utils
import { growMaxSpan } from '../growMaxSpan';

describe('growMaxSpan', () => {
  it('should grow while the predicate stays clear', () => {
    expect(growMaxSpan(0, 5, (value) => value < 3)).toBe(3);
  });

  it('should stop at the limit even if the predicate never fails', () => {
    expect(growMaxSpan(0, 4, () => true)).toBe(4);
  });

  it('should return at least 1 even when the very first value is blocked', () => {
    expect(growMaxSpan(0, 5, () => false)).toBe(1);
  });

  it('should measure from a non-zero start', () => {
    expect(growMaxSpan(2, 5, (value) => value < 4)).toBe(2);
  });
});
