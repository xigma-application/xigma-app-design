// utils
import { isPointInRect } from '../isPointInRect';

const rect = { height: 10, width: 10, x: 0, y: 0 };

describe('isPointInRect', () => {
  it('should return true for a point inside the rect', () => {
    // result
    expect(isPointInRect({ x: 5, y: 5 }, rect)).toBe(true);
  });

  it('should return true for a point on the edge of the rect', () => {
    // result
    expect(isPointInRect({ x: 10, y: 10 }, rect)).toBe(true);
  });

  it('should return false for a point outside the rect', () => {
    // result
    expect(isPointInRect({ x: 50, y: 50 }, rect)).toBe(false);
  });

  it('should return false for a point inside the bounding box but cut off by a rounded corner', () => {
    // mock — a 100x100 rect with cornerRadius 20; the arc center for the nw corner sits at (20, 20)
    const roundedRect = { cornerRadius: 20, height: 100, width: 100, x: 0, y: 0 };

    // result — (2, 2) is ~25.5 from the arc center, well outside the 20-radius circle
    expect(isPointInRect({ x: 2, y: 2 }, roundedRect)).toBe(false);
  });

  it('should return true for a point inside the rounded corner arc', () => {
    // mock
    const roundedRect = { cornerRadius: 20, height: 100, width: 100, x: 0, y: 0 };

    // result — (10, 10) is ~14.1 from the nw arc center (20, 20), inside the 20-radius circle
    expect(isPointInRect({ x: 10, y: 10 }, roundedRect)).toBe(true);
  });

  it('should return false near a bottom corner cut off by rounding too, not just the top corners', () => {
    // mock — the se arc center sits at (80, 80); (98, 98) is ~25.5 away, well outside the radius
    const roundedRect = { cornerRadius: 20, height: 100, width: 100, x: 0, y: 0 };

    // result
    expect(isPointInRect({ x: 98, y: 98 }, roundedRect)).toBe(false);
  });

  it('should return true along a straight edge, away from any corner, regardless of cornerRadius', () => {
    // mock
    const roundedRect = { cornerRadius: 20, height: 100, width: 100, x: 0, y: 0 };

    // result — (50, 2) sits on the top edge, far from either corner's radius margin
    expect(isPointInRect({ x: 50, y: 2 }, roundedRect)).toBe(true);
  });

  it('should treat cornerRadius 0 the same as no cornerRadius field at all', () => {
    // mock
    const zeroRadiusRect = { cornerRadius: 0, height: 10, width: 10, x: 0, y: 0 };

    // result — a plain corner point stays inside once the radius is 0
    expect(isPointInRect({ x: 0, y: 0 }, zeroRadiusRect)).toBe(true);
  });
});
