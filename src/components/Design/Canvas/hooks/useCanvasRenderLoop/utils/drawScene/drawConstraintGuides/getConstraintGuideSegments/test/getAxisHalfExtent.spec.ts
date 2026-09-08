// utils
import { getAxisHalfExtent } from '../getAxisHalfExtent';

describe('getAxisHalfExtent', () => {
  it('should return the along-axis half size when the box is axis-aligned with the guide', () => {
    // along = |cos 0| = 1, across = |sin 0| = 0
    expect(getAxisHalfExtent(1, 0, 20, 15)).toBe(20);
  });

  it('should return the smaller of the two axis limits', () => {
    // limitAlong = 20 / 0.5 = 40, limitAcross = 8 / 0.5 = 16
    expect(getAxisHalfExtent(0.5, 0.5, 20, 8)).toBe(16);
  });

  it('should treat a zero component as an unbounded limit on that axis', () => {
    expect(getAxisHalfExtent(0, 1, 20, 15)).toBe(15);
  });
});
