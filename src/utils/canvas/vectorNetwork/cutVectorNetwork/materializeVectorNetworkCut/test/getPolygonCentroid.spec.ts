// utils
import { getPolygonCentroid } from '../getPolygonCentroid';

describe('getPolygonCentroid', () => {
  it('should average every point’s x/y into a single centroid point', () => {
    // mock — a right triangle
    const points = [
      { x: 0, y: 0 },
      { x: 6, y: 0 },
      { x: 0, y: 3 },
    ];

    // before
    const centroid = getPolygonCentroid(points);

    // result
    expect(centroid).toEqual({ x: 2, y: 1 });
  });

  it('should return a square’s exact center', () => {
    // mock
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];

    // before
    const centroid = getPolygonCentroid(points);

    // result
    expect(centroid).toEqual({ x: 5, y: 5 });
  });
});
