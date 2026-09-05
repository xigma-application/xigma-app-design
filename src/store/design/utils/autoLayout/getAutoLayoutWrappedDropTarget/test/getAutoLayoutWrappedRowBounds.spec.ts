// types
import { AlignmentLayout } from 'types/design/enums';

// utils
import { getAutoLayoutWrappedRowBounds } from '../getAutoLayoutWrappedRowBounds';

// a 250-wide frame fits exactly two 100-wide children per row (100 + 20 gap + 100 = 220 <= 250), so
// a third 100-wide child wraps onto its own second row
const CONTENT_BOX = { height: 400, width: 250, x: 0, y: 0 };
const CHILDREN = [
  { height: 100, id: '1', width: 100 },
  { height: 100, id: '2', width: 100 },
  { height: 100, id: '3', width: 100 },
];
const DRAGGED_SIZE = { height: 100, width: 100 };

describe('getAutoLayoutWrappedRowBounds', () => {
  it('should report the first row’s own slice and frame when the cursor sits over it', () => {
    // action — cursor within row 1 (y=50), no reorder in progress
    const bounds = getAutoLayoutWrappedRowBounds(true, 20, 20, AlignmentLayout.topLeft, CONTENT_BOX, CHILDREN, null, DRAGGED_SIZE, {
      x: 0,
      y: 50,
    });

    // result
    expect(bounds).toEqual({ realEnd: 2, realStart: 0, rowFrame: { height: 100, width: 250, x: 0, y: 0 }, rowOriginalIndex: null });
  });

  it('should report the second row’s own slice and frame when the cursor sits over it', () => {
    // action — cursor within row 2 (y=150)
    const bounds = getAutoLayoutWrappedRowBounds(true, 20, 20, AlignmentLayout.topLeft, CONTENT_BOX, CHILDREN, null, DRAGGED_SIZE, {
      x: 0,
      y: 150,
    });

    // result
    expect(bounds).toEqual({ realEnd: 3, realStart: 2, rowFrame: { height: 100, width: 250, x: 0, y: 120 }, rowOriginalIndex: null });
  });

  it('should shift the real slice back once the dragged placeholder’s own row is cut past its index', () => {
    // action — reordering item at index 0, cursor still over row 1 (which now also contains the
    // simulated placeholder at index 0)
    const bounds = getAutoLayoutWrappedRowBounds(true, 20, 20, AlignmentLayout.topLeft, CONTENT_BOX, CHILDREN, 0, DRAGGED_SIZE, {
      x: 0,
      y: 50,
    });

    // result — rowOriginalIndex reports the placeholder's own position within the row
    expect(bounds.rowOriginalIndex).toBe(0);
  });
});
