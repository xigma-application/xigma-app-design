// utils
import { getPolygonCentroid } from '../getPolygonCentroid';

describe('getPolygonCentroid', () => {
  it('should average the x/y coordinates of every point', () => {
    // mock
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];

    // before
    const centroid = getPolygonCentroid(points);

    // result
    expect(centroid).toEqual({ x: 50, y: 50 });
  });

  it('should return the single point unchanged for a one-point polygon', () => {
    // mock
    const points = [{ x: 5, y: 12 }];

    // before
    const centroid = getPolygonCentroid(points);

    // result
    expect(centroid).toEqual({ x: 5, y: 12 });
  });
});
