// utils
import { getMirroredTaperWidthMultiplier } from '../getMirroredTaperWidthMultiplier';

describe('getMirroredTaperWidthMultiplier', () => {
  it('should meet at the same flat, truncated width on both sides of the seam', () => {
    expect(getMirroredTaperWidthMultiplier(0)).toBe(0.6);
    expect(getMirroredTaperWidthMultiplier(1)).toBe(0.6);
  });

  it('should stay flat at the full base width for the middle of the loop', () => {
    expect(getMirroredTaperWidthMultiplier(0.25)).toBe(1);
    expect(getMirroredTaperWidthMultiplier(0.5)).toBe(1);
    expect(getMirroredTaperWidthMultiplier(0.75)).toBe(1);
  });

  it('should ease between the truncated seam width and the full base width', () => {
    expect(getMirroredTaperWidthMultiplier(0.125)).toBeCloseTo(0.8);
    expect(getMirroredTaperWidthMultiplier(0.875)).toBeCloseTo(0.8);
  });
});
