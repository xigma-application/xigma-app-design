// types
import { AlignmentLayout } from 'types/design/enums';

// utils
import { getAutoLayoutCursorRowRange } from '../getAutoLayoutCursorRowRange';

// a 250-wide content box fits two 100-wide children per row (100 + 20 + 100 = 220 <= 250), so a
// third wraps onto its own row 2 — row 1 band y[0,100], row 2 band y[120,220], boundary at y=110
const CONTENT_BOX = { height: 400, width: 250, x: 0, y: 0 };
const CHILDREN = [
  { height: 100, id: '1', width: 100 },
  { height: 100, id: '2', width: 100 },
  { height: 100, id: '3', width: 100 },
];

describe('getAutoLayoutCursorRowRange', () => {
  it('should return an empty range when there are no children at all', () => {
    // action
    const range = getAutoLayoutCursorRowRange(true, 20, 20, AlignmentLayout.topLeft, CONTENT_BOX, [], { x: 50, y: 50 });

    // result
    expect(range).toEqual({ bandEnd: 0, bandStart: 0, end: 0, start: 0 });
  });

  it('should span the whole child array when everything fits on a single row', () => {
    // action — only the first two children, which comfortably share row 1
    const range = getAutoLayoutCursorRowRange(true, 20, 20, AlignmentLayout.topLeft, CONTENT_BOX, CHILDREN.slice(0, 2), { x: 50, y: 50 });

    // result
    expect(range).toEqual({ bandEnd: 100, bandStart: 0, end: 2, start: 0 });
  });

  it('should resolve to row 1’s own index range and band for a cursor above the boundary', () => {
    // action
    const range = getAutoLayoutCursorRowRange(true, 20, 20, AlignmentLayout.topLeft, CONTENT_BOX, CHILDREN, { x: 50, y: 50 });

    // result — row 1 holds children 0 and 1 ('1' and '2')
    expect(range).toEqual({ bandEnd: 100, bandStart: 0, end: 2, start: 0 });
  });

  it('should resolve to row 2’s own index range and band for a cursor below the boundary', () => {
    // action
    const range = getAutoLayoutCursorRowRange(true, 20, 20, AlignmentLayout.topLeft, CONTENT_BOX, CHILDREN, { x: 50, y: 150 });

    // result — row 2 holds only child 2 ('3'), at flat index 2
    expect(range).toEqual({ bandEnd: 220, bandStart: 120, end: 3, start: 2 });
  });

  it('should resolve to the very first row for a cursor above every row entirely', () => {
    // action
    const range = getAutoLayoutCursorRowRange(true, 20, 20, AlignmentLayout.topLeft, CONTENT_BOX, CHILDREN, { x: 50, y: -999 });

    // result
    expect(range).toEqual({ bandEnd: 100, bandStart: 0, end: 2, start: 0 });
  });

  it('should resolve to the very last row for a cursor below every row entirely', () => {
    // action
    const range = getAutoLayoutCursorRowRange(true, 20, 20, AlignmentLayout.topLeft, CONTENT_BOX, CHILDREN, { x: 50, y: 999 });

    // result
    expect(range).toEqual({ bandEnd: 220, bandStart: 120, end: 3, start: 2 });
  });

  it('should compare the counter axis on x, not y, for a vertical (column-wrapping) frame', () => {
    // action — a 250-tall content box, columns instead of rows; cursor over column 2
    const range = getAutoLayoutCursorRowRange(false, 20, 20, AlignmentLayout.topLeft, { height: 250, width: 400, x: 0, y: 0 }, CHILDREN, {
      x: 150,
      y: 50,
    });

    // result
    expect(range).toEqual({ bandEnd: 220, bandStart: 120, end: 3, start: 2 });
  });
});
