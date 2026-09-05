// utils
import { getReadingOrderSlotFromRows } from '../getReadingOrderSlotFromRows';

// three rows of two 100x100 boxes each: [1,2] / [3,4] / [5,6]
const ROWS = [
  [
    { height: 100, width: 100, x: 0, y: 0 },
    { height: 100, width: 100, x: 100, y: 0 },
  ],
  [
    { height: 100, width: 100, x: 0, y: 100 },
    { height: 100, width: 100, x: 100, y: 100 },
  ],
  [
    { height: 100, width: 100, x: 0, y: 200 },
    { height: 100, width: 100, x: 100, y: 200 },
  ],
];

describe('getReadingOrderSlotFromRows', () => {
  it('should return 0 when the cursor is over the first item', () => {
    expect(getReadingOrderSlotFromRows(true, ROWS, { x: 50, y: 50 })).toBe(0);
  });

  it('should count the first item once the cursor clears its far edge, still on row 1', () => {
    expect(getReadingOrderSlotFromRows(true, ROWS, { x: 150, y: 50 })).toBe(1);
  });

  it('should count every earlier row in full once the cursor is on a later row', () => {
    // cursor over item 5 (row 3, left column): rows 1 and 2 fully passed, item 5 not yet cleared
    expect(getReadingOrderSlotFromRows(true, ROWS, { x: 50, y: 250 })).toBe(4);
  });

  it('should also count item 5 once the cursor clears its far edge', () => {
    expect(getReadingOrderSlotFromRows(true, ROWS, { x: 150, y: 250 })).toBe(5);
  });

  it('should return the full count when the cursor is past the last item', () => {
    expect(getReadingOrderSlotFromRows(true, ROWS, { x: 250, y: 250 })).toBe(6);
  });

  it('should return 0 when the cursor is above every row', () => {
    expect(getReadingOrderSlotFromRows(true, ROWS, { x: 50, y: -50 })).toBe(0);
  });

  it('should return the full count when the cursor is below every row', () => {
    expect(getReadingOrderSlotFromRows(true, ROWS, { x: 50, y: 999 })).toBe(6);
  });

  it('should map "in the gap between two rows" to the end of the upper row', () => {
    // a gap layout: row 1 at y0-100, row 2 at y150-250; cursor at y=120 (between them)
    const gapped = [
      [
        { height: 100, width: 100, x: 0, y: 0 },
        { height: 100, width: 100, x: 100, y: 0 },
      ],
      [
        { height: 100, width: 100, x: 0, y: 150 },
        { height: 100, width: 100, x: 100, y: 150 },
      ],
    ];

    expect(getReadingOrderSlotFromRows(true, gapped, { x: 50, y: 120 })).toBe(2);
  });

  it('should return 0 for an empty list of rows', () => {
    expect(getReadingOrderSlotFromRows(true, [], { x: 50, y: 50 })).toBe(0);
  });
});
