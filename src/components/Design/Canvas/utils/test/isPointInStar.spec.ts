// utils
import { isPointInStar } from '../isPointInStar';

const star = { flipX: false, flipY: false, height: 100, points: 5, ratio: 0.382, width: 100, x: 0, y: 0 };

describe('isPointInStar', () => {
  it('should return true for the center point', () => {
    // result
    expect(isPointInStar({ x: 50, y: 50 }, star)).toBe(true);
  });

  it('should return true for a point near an outer tip', () => {
    // result
    expect(isPointInStar({ x: 50, y: 5 }, star)).toBe(true);
  });

  it('should return false for a point in a concave notch between two arms but inside the bounding box', () => {
    // result — this point sits along a valley direction, beyond the inner radius reached there
    expect(isPointInStar({ x: 73.51, y: 17.64 }, star)).toBe(false);
  });

  it('should return false for a point far outside the star', () => {
    // result
    expect(isPointInStar({ x: 200, y: 200 }, star)).toBe(false);
  });

  it('should test against the actually mirrored geometry for an odd point-count star', () => {
    // mock — the star's single outer tip sits at the top (50, 0); a vertical flip is not a
    const flippedStar = { ...star, flipY: true };

    // result — (50, 5) sits just below the unflipped tip (inside); once flipY moves that tip to
    expect(isPointInStar({ x: 50, y: 5 }, star)).toBe(true);
    expect(isPointInStar({ x: 50, y: 5 }, flippedStar)).toBe(false);
    expect(isPointInStar({ x: 50, y: 95 }, star)).toBe(false);
    expect(isPointInStar({ x: 50, y: 95 }, flippedStar)).toBe(true);
  });

  it('should return true near a concave vertex once cornerRadius rounds it, even though the sharp shape excludes that point', () => {
    // mock — rounding a concave (inner) vertex at (61.23, 34.55) bulges the boundary outward into
    const roundedStar = { ...star, cornerRadius: 9.5 };

    // result
    expect(isPointInStar({ x: 62.15, y: 33.28 }, star)).toBe(false);
    expect(isPointInStar({ x: 62.15, y: 33.28 }, roundedStar)).toBe(true);
  });
});
