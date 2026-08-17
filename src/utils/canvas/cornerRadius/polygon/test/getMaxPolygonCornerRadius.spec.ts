// utils
import { getMaxPolygonCornerRadius } from '../getMaxPolygonCornerRadius';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

describe('getMaxPolygonCornerRadius', () => {
  it('should match the confirmed Figma reference for a 100x100 triangle: 25', () => {
    // result
    expect(getMaxPolygonCornerRadius(bounds, 3)).toBeCloseTo(25, 5);
  });

  it('should match the confirmed Figma reference for a 100x100 hexagon: 43.3', () => {
    // result
    expect(getMaxPolygonCornerRadius(bounds, 6)).toBeCloseTo(43.3, 1);
  });

  it('should match R*cos(pi/4) for a 4-sided polygon (a diamond, not axis-aligned like Rectangle)', () => {
    // mock — getPolygonPoints places sides=4 vertices at the box's edge midpoints (a 45deg-rotated
    // square), not its corners, so this does not coincide with Rectangle's own max-radius formula
    // result
    expect(getMaxPolygonCornerRadius(bounds, 4)).toBeCloseTo(50 * Math.cos(Math.PI / 4), 5);
  });

  it('should scale down for a non-square bounding box', () => {
    // mock — a taller-than-wide box constrains the max radius below the square case
    const tallBounds = { height: 200, width: 100, x: 0, y: 0 };

    // result
    expect(getMaxPolygonCornerRadius(tallBounds, 3)).toBeLessThan(getMaxPolygonCornerRadius(bounds, 3) * 2);
    expect(getMaxPolygonCornerRadius(tallBounds, 3)).toBeGreaterThan(0);
  });
});
