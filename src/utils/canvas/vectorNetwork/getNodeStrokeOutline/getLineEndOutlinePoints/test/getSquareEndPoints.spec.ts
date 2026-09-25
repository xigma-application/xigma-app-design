// utils
import { getSquareEndPoints } from '../getSquareEndPoints';

describe('getSquareEndPoints', () => {
  it('should extend the line end by half its width', () => {
    // result
    expect(getSquareEndPoints(2)).toEqual([
      { x: 0, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: -2 },
      { x: 0, y: -2 },
    ]);
  });
});
