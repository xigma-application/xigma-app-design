// utils
import { toPoints } from '../toPoints';

describe('toPoints', () => {
  it('should group interleaved x,y numbers into points', () => {
    // result
    expect(toPoints([1, 2, 3, 4])).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
  });

  it('should return an empty array for an empty input', () => {
    // result
    expect(toPoints([])).toEqual([]);
  });
});
