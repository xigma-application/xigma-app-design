// utils
import { getTaperWidthMultiplier } from '../getTaperWidthMultiplier';

describe('getTaperWidthMultiplier', () => {
  it('should ease continuously from full width down to a flat, truncated end width, never to zero', () => {
    expect(getTaperWidthMultiplier(0, false)).toBe(1);
    expect(getTaperWidthMultiplier(0.5, false)).toBeCloseTo(0.75);
    expect(getTaperWidthMultiplier(1, false)).toBe(0.5);
  });

  it('should flip so the thick end moves to the other side of the seam', () => {
    expect(getTaperWidthMultiplier(0, true)).toBe(0.5);
    expect(getTaperWidthMultiplier(1, true)).toBe(1);
  });
});
