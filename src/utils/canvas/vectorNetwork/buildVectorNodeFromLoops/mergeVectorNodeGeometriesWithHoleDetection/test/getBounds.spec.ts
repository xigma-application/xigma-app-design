// utils
import { getBounds } from '../getBounds';

describe('getBounds', () => {
  it('should compute the bounding box of a set of points', () => {
    expect(
      getBounds([
        { x: 2, y: 5 },
        { x: 10, y: 1 },
        { x: -3, y: 8 },
      ]),
    ).toEqual([-3, 1, 10, 8]);
  });

  it('should collapse to a single point when there is only one point', () => {
    expect(getBounds([{ x: 4, y: 7 }])).toEqual([4, 7, 4, 7]);
  });
});
