// utils
import { getGridRows } from '../getGridRows';

describe('getGridRows', () => {
  it('should group overlapping layers into rows, top to bottom, each sorted left to right', () => {
    // mock
    const rects = [
      { height: 10, width: 10, x: 40, y: 32 },
      { height: 10, width: 10, x: 0, y: 30 },
      { height: 10, width: 10, x: 40, y: 2 },
      { height: 10, width: 10, x: 0, y: 0 },
    ];

    // result
    expect(getGridRows(rects)).toEqual([
      [3, 2],
      [1, 0],
    ]);
  });
});
