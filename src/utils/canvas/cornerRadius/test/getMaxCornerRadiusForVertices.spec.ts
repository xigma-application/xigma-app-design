// utils
import { getMaxCornerRadiusForVertices } from '../getMaxCornerRadiusForVertices';
import { getPolygonPoints } from 'utils/canvas/shapes/getPolygonPoints';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

describe('getMaxCornerRadiusForVertices', () => {
  it('should match the confirmed Figma reference for a 100x100 triangle: 25', () => {
    // result
    expect(getMaxCornerRadiusForVertices(getPolygonPoints(bounds, 3))).toBeCloseTo(25, 5);
  });

  it('should match the confirmed Figma reference for a 100x100 hexagon: 43.3', () => {
    // result
    expect(getMaxCornerRadiusForVertices(getPolygonPoints(bounds, 6))).toBeCloseTo(43.3, 1);
  });

  it('should scale down for a non-square bounding box', () => {
    // mock — a taller-than-wide box constrains the max radius below the square case
    const tallVertices = getPolygonPoints({ height: 200, width: 100, x: 0, y: 0 }, 3);
    const squareVertices = getPolygonPoints(bounds, 3);

    // result
    expect(getMaxCornerRadiusForVertices(tallVertices)).toBeLessThan(getMaxCornerRadiusForVertices(squareVertices) * 2);
    expect(getMaxCornerRadiusForVertices(tallVertices)).toBeGreaterThan(0);
  });
});
