// utils
import { getPolygonPoints } from '../getPolygonPoints';

describe('getPolygonPoints', () => {
  it('should return the requested number of vertices', () => {
    // result
    expect(getPolygonPoints({ height: 20, width: 10, x: 0, y: 0 }, 6)).toHaveLength(6);
  });

  it('should place the first vertex at the top of the bounding rect, apex up', () => {
    // before
    const points = getPolygonPoints({ height: 20, width: 10, x: 0, y: 0 }, 3);

    // result
    expect(points[0].x).toBeCloseTo(5);
    expect(points[0].y).toBeCloseTo(0);
  });

  it('should place a diamond shape at the cardinal points of the bounding rect for 4 sides', () => {
    // before
    const points = getPolygonPoints({ height: 10, width: 10, x: 0, y: 0 }, 4);

    // result
    expect(points[0]).toEqual({ x: 5, y: 0 });
    expect(points[1].x).toBeCloseTo(10);
    expect(points[1].y).toBeCloseTo(5);
    expect(points[2].x).toBeCloseTo(5);
    expect(points[2].y).toBeCloseTo(10);
    expect(points[3].x).toBeCloseTo(0);
    expect(points[3].y).toBeCloseTo(5);
  });

  it('should offset points by the rect origin', () => {
    // before
    const points = getPolygonPoints({ height: 10, width: 10, x: 5, y: 5 }, 4);

    // result
    expect(points[0]).toEqual({ x: 10, y: 5 });
  });
});
