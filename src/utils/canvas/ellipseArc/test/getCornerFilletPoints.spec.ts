// utils
import { getCornerFilletPoints } from '../getCornerFilletPoints';

describe('getCornerFilletPoints', () => {
  it('should bend a right-angle corner along a quarter circle between the two cut points', () => {
    // before
    const points = getCornerFilletPoints({ x: 0, y: 10 }, { x: 1, y: 0 }, { x: 10, y: 0 }, { x: 0, y: -1 }, 10, 8);

    // result
    expect(points).toHaveLength(7);
    points.forEach((point) => {
      expect(Math.hypot(point.x, point.y)).toBeCloseTo(10, 1);
    });
  });
});
