// utils
import { getRectEdgeMidpoints } from '../getRectEdgeMidpoints';

describe('getRectEdgeMidpoints', () => {
  it('should return the 4 edge midpoints in top, right, bottom, left order', () => {
    // result
    expect(getRectEdgeMidpoints({ height: 20, width: 10, x: 5, y: 5 })).toEqual([
      { x: 10, y: 5 },
      { x: 15, y: 15 },
      { x: 10, y: 25 },
      { x: 5, y: 15 },
    ]);
  });
});
