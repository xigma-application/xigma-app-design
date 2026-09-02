// utils
import { getPointsBounds } from '../getPointsBounds';

describe('getPointsBounds', () => {
  it('should return null for an empty list', () => {
    expect(getPointsBounds([])).toBeNull();
  });

  it('should return a zero-size rect for a single point', () => {
    expect(getPointsBounds([{ x: 10, y: 20 }])).toEqual({ height: 0, width: 0, x: 10, y: 20 });
  });

  it('should return the bounding box of several points, ignoring order', () => {
    expect(
      getPointsBounds([
        { x: 50, y: 100 },
        { x: 0, y: 0 },
        { x: 100, y: 40 },
      ]),
    ).toEqual({ height: 100, width: 100, x: 0, y: 0 });
  });
});
