// utils
import { getPolygonShapePoints } from '../getPolygonShapePoints';

const bounds = { height: 20, width: 20, x: 0, y: 0 };

describe('getPolygonShapePoints', () => {
  it('should return the sharp polygon points when there is no corner radius', () => {
    expect(getPolygonShapePoints(bounds, 3, 0)).toHaveLength(3);
  });

  it('should return faceted rounded corner points when there is a corner radius', () => {
    expect(getPolygonShapePoints(bounds, 3, 2).length).toBeGreaterThan(3);
  });
});
