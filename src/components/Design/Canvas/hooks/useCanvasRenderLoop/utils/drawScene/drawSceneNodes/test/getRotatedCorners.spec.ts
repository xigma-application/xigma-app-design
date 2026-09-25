// utils
import { getRotatedCorners } from '../getRotatedCorners';

describe('getRotatedCorners', () => {
  it('should return the four corners clockwise from the top-left when unrotated', () => {
    // result
    expect(getRotatedCorners({ height: 10, width: 20, x: 0, y: 0 }, 0)).toEqual([
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 10 },
      { x: 0, y: 10 },
    ]);
  });

  it('should rotate the corners around the center', () => {
    // before
    const [topLeft] = getRotatedCorners({ height: 10, width: 10, x: 0, y: 0 }, 90);

    // result
    expect(topLeft.x).toBeCloseTo(10);
    expect(topLeft.y).toBeCloseTo(0);
  });
});
