// utils
import { getRectCorners } from '../getRectCorners';

describe('getRectCorners', () => {
  it('should return the 4 corners in top-left, top-right, bottom-right, bottom-left order', () => {
    // result
    expect(getRectCorners({ height: 20, width: 10, x: 5, y: 5 })).toEqual([
      { x: 5, y: 5 },
      { x: 15, y: 5 },
      { x: 15, y: 25 },
      { x: 5, y: 25 },
    ]);
  });
});
