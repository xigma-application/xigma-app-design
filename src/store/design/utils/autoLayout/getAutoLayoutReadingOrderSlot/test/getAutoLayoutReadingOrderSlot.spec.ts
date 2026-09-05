// utils
import { getAutoLayoutReadingOrderSlot } from '../getAutoLayoutReadingOrderSlot';

// six 100x100 boxes, two per row: [1,2] / [3,4] / [5,6]
const GRID = [
  { height: 100, width: 100, x: 0, y: 0 },
  { height: 100, width: 100, x: 100, y: 0 },
  { height: 100, width: 100, x: 0, y: 100 },
  { height: 100, width: 100, x: 100, y: 100 },
  { height: 100, width: 100, x: 0, y: 200 },
  { height: 100, width: 100, x: 100, y: 200 },
];

describe('getAutoLayoutReadingOrderSlot', () => {
  it('should return 0 when the cursor is over the first item', () => {
    expect(getAutoLayoutReadingOrderSlot(true, GRID, { x: 50, y: 50 })).toBe(0);
  });

  it('should count the first item once the cursor clears its far edge, still on row 1', () => {
    expect(getAutoLayoutReadingOrderSlot(true, GRID, { x: 150, y: 50 })).toBe(1);
  });

  it('should count every earlier row in full once the cursor is on a later row', () => {
    // cursor over item 5 (row 3, left column): rows 1 and 2 fully passed, item 5 not yet cleared
    expect(getAutoLayoutReadingOrderSlot(true, GRID, { x: 50, y: 250 })).toBe(4);
  });

  it('should also count item 5 once the cursor clears its far edge', () => {
    expect(getAutoLayoutReadingOrderSlot(true, GRID, { x: 150, y: 250 })).toBe(5);
  });

  it('should return the full count when the cursor is past the last item', () => {
    expect(getAutoLayoutReadingOrderSlot(true, GRID, { x: 250, y: 250 })).toBe(6);
  });

  it('should return 0 when the cursor is above every row', () => {
    expect(getAutoLayoutReadingOrderSlot(true, GRID, { x: 50, y: -50 })).toBe(0);
  });

  it('should return the full count when the cursor is below every row', () => {
    expect(getAutoLayoutReadingOrderSlot(true, GRID, { x: 50, y: 999 })).toBe(6);
  });

  it('should map "in the gap between two rows" to the end of the upper row', () => {
    // a gap layout: row 1 at y0-100, row 2 at y150-250; cursor at y=120 (between them)
    const gapped = [
      { height: 100, width: 100, x: 0, y: 0 },
      { height: 100, width: 100, x: 100, y: 0 },
      { height: 100, width: 100, x: 0, y: 150 },
      { height: 100, width: 100, x: 100, y: 150 },
    ];

    expect(getAutoLayoutReadingOrderSlot(true, gapped, { x: 50, y: 120 })).toBe(2);
  });

  it('should walk columns then rows-across for a vertical (column-wrapping) frame', () => {
    // rotate the grid: two per column, columns left-to-right
    const columns = [
      { height: 100, width: 100, x: 0, y: 0 },
      { height: 100, width: 100, x: 0, y: 100 },
      { height: 100, width: 100, x: 100, y: 0 },
      { height: 100, width: 100, x: 100, y: 100 },
    ];

    // cursor within column 2, past item 3's far (bottom) edge — column 1 fully passed, item 3 cleared
    expect(getAutoLayoutReadingOrderSlot(false, columns, { x: 150, y: 150 })).toBe(3);
  });
});
