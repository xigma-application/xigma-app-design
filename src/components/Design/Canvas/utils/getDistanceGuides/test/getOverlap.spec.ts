// utils
import { getOverlap } from '../getOverlap';

describe('getOverlap', () => {
  it('should return a positive value when the two ranges share a span', () => {
    expect(getOverlap(0, 100, 50, 150)).toBe(50);
  });

  it('should return a negative value (the gap) when the ranges have no shared span', () => {
    expect(getOverlap(0, 100, 150, 200)).toBe(-50);
  });

  it('should return zero when the ranges merely touch', () => {
    expect(getOverlap(0, 100, 100, 200)).toBe(0);
  });
});
