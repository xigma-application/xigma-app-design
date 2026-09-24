// utils
import { getModeGap } from '../getModeGap';

describe('getModeGap', () => {
  it('should pick the most common rounded gap', () => {
    // result
    expect(getModeGap([10.2, 30, 9.8, 12])).toBe(10);
  });

  it('should pick the smaller gap on a tie and clamp overlaps to zero', () => {
    // result
    expect(getModeGap([20, 8])).toBe(8);
    expect(getModeGap([-5, -3])).toBe(0);
  });

  it('should fall back to zero without any gap', () => {
    // result
    expect(getModeGap([])).toBe(0);
  });
});
