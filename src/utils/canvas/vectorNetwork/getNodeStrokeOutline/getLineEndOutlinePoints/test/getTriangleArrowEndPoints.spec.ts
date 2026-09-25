// utils
import { getTriangleArrowEndPoints } from '../getTriangleArrowEndPoints';

describe('getTriangleArrowEndPoints', () => {
  it('should put a filled triangle with its tip on the line end', () => {
    // result
    expect(getTriangleArrowEndPoints(2)).toEqual([
      { x: -16, y: 2 },
      { x: -16, y: 8 },
      { x: 0, y: 0 },
      { x: -16, y: -8 },
      { x: -16, y: -2 },
    ]);
  });
});
