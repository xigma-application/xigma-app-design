// utils
import { getQuarterTaperWidthMultiplier } from '../getQuarterTaperWidthMultiplier';

describe('getQuarterTaperWidthMultiplier', () => {
  it('should meet at the same truncated width on both sides of the seam', () => {
    expect(getQuarterTaperWidthMultiplier(0, false)).toBe(0.6);
    expect(getQuarterTaperWidthMultiplier(1, false)).toBe(0.6);
  });

  it('should rise gradually from the seam back up to the flat base width', () => {
    expect(getQuarterTaperWidthMultiplier(0.075, false)).toBeCloseTo(0.8);
    expect(getQuarterTaperWidthMultiplier(0.15, false)).toBe(1);
  });

  it('should stay flat at the base width for the middle of the loop', () => {
    expect(getQuarterTaperWidthMultiplier(0.5, false)).toBe(1);
    expect(getQuarterTaperWidthMultiplier(0.75, false)).toBe(1);
  });

  it('should ease back down from the flat base toward the seam over the last quarter', () => {
    expect(getQuarterTaperWidthMultiplier(0.875, false)).toBeCloseTo(0.8);
  });

  it('should flip which side of the seam has the quick rise versus the long descent', () => {
    expect(getQuarterTaperWidthMultiplier(0, true)).toBe(0.6);
    expect(getQuarterTaperWidthMultiplier(1, true)).toBe(0.6);
    expect(getQuarterTaperWidthMultiplier(0.075, true)).not.toBeCloseTo(getQuarterTaperWidthMultiplier(0.075, false));
  });
});
