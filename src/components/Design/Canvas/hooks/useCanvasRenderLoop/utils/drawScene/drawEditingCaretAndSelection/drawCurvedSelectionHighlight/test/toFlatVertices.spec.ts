// utils
import { toFlatVertices } from '../toFlatVertices';

describe('toFlatVertices', () => {
  it('should flatten a list of points into interleaved x,y numbers', () => {
    // result
    expect(
      toFlatVertices([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]),
    ).toEqual([1, 2, 3, 4]);
  });

  it('should return an empty array for an empty input', () => {
    // result
    expect(toFlatVertices([])).toEqual([]);
  });
});
