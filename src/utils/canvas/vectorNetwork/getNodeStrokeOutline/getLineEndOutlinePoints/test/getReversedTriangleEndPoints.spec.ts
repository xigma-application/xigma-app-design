// utils
import { getReversedTriangleEndPoints } from '../getReversedTriangleEndPoints';

describe('getReversedTriangleEndPoints', () => {
  it('should put the base of a filled triangle on the line end with its tip pointing back along the line', () => {
    // result
    expect(getReversedTriangleEndPoints(2)).toEqual([
      { x: -12, y: 2 },
      { x: 0, y: 8 },
      { x: 0, y: -8 },
      { x: -12, y: -2 },
    ]);
  });
});
