// utils
import { getArcLengths } from '../getArcLengths';

describe('getArcLengths', () => {
  it('should accumulate the distance along the points starting at zero', () => {
    // result
    expect(
      getArcLengths([
        { x: 0, y: 0 },
        { x: 3, y: 4 },
        { x: 3, y: 10 },
      ]),
    ).toEqual([0, 5, 11]);
  });

  it('should be empty for no points', () => {
    // result
    expect(getArcLengths([])).toEqual([]);
  });
});
