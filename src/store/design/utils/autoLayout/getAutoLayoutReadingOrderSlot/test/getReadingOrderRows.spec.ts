// utils
import { getReadingOrderRows } from '../getReadingOrderRows';

// six 100x100 boxes, two per row: [1,2] / [3,4] / [5,6]
const GRID = [
  { height: 100, width: 100, x: 0, y: 0 },
  { height: 100, width: 100, x: 100, y: 0 },
  { height: 100, width: 100, x: 0, y: 100 },
  { height: 100, width: 100, x: 100, y: 100 },
  { height: 100, width: 100, x: 0, y: 200 },
  { height: 100, width: 100, x: 100, y: 200 },
];

describe('getReadingOrderRows', () => {
  it('should return an empty list for no children', () => {
    expect(getReadingOrderRows(true, [])).toEqual([]);
  });

  it('should put a lone child in its own row', () => {
    expect(getReadingOrderRows(true, [GRID[0]])).toEqual([[GRID[0]]]);
  });

  it('should group children whose counter-start falls within half the row’s own thickness of the row’s first member', () => {
    expect(getReadingOrderRows(true, GRID)).toEqual([
      [GRID[0], GRID[1]],
      [GRID[2], GRID[3]],
      [GRID[4], GRID[5]],
    ]);
  });

  it('should walk columns then rows-across for a vertical (column-wrapping) frame', () => {
    // rotate the grid: two per column, columns left-to-right
    const columns = [
      { height: 100, width: 100, x: 0, y: 0 },
      { height: 100, width: 100, x: 0, y: 100 },
      { height: 100, width: 100, x: 100, y: 0 },
      { height: 100, width: 100, x: 100, y: 100 },
    ];

    expect(getReadingOrderRows(false, columns)).toEqual([
      [columns[0], columns[1]],
      [columns[2], columns[3]],
    ]);
  });
});
