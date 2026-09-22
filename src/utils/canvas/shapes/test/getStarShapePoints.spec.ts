// utils
import { getStarShapePoints } from '../getStarShapePoints';

const bounds = { height: 20, width: 20, x: 0, y: 0 };

describe('getStarShapePoints', () => {
  it('should return the sharp star points when there is no corner radius', () => {
    expect(getStarShapePoints(bounds, 5, 0.5, 0)).toHaveLength(10);
  });

  it('should return faceted rounded corner points when there is a corner radius', () => {
    expect(getStarShapePoints(bounds, 5, 0.5, 1).length).toBeGreaterThan(10);
  });
});
