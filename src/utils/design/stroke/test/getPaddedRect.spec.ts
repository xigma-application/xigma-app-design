// utils
import { getPaddedRect } from '../getPaddedRect';

describe('getPaddedRect', () => {
  it('should grow the rect by each side padding', () => {
    // result
    expect(getPaddedRect({ height: 10, width: 20, x: 5, y: 6 }, { bottom: 4, left: 1, right: 2, top: 3 })).toEqual({
      height: 17,
      width: 23,
      x: 4,
      y: 3,
    });
  });
});
