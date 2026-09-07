// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';

// utils
import { getAutoLayoutWrappedRowDropTarget } from '../getAutoLayoutWrappedRowDropTarget';

const ROW_FRAME = { height: 100, width: 250, x: 0, y: 0 };
const CHILDREN = [
  { height: 100, id: '1', width: 100 },
  { height: 100, id: '2', width: 100 },
  { height: 100, id: '3', width: 100 },
];
const REAL_POSITIONS = [
  { height: 100, id: '1', width: 100, x: 0, y: 0 },
  { height: 100, id: '2', width: 100, x: 120, y: 0 },
  { height: 100, id: '3', width: 100, x: 0, y: 120 },
];
const DRAGGED_SIZE = { height: 100, width: 100 };

describe('getAutoLayoutWrappedRowDropTarget', () => {
  it('should compute the drop target restricted to the row’s own slice of children, ignoring siblings outside it', () => {
    // action — row is just [1, 2] (realStart 0, realEnd 2); cursor lands before '1'
    const dropTarget = getAutoLayoutWrappedRowDropTarget(
      LayoutMode.horizontal,
      20,
      AlignmentLayout.topLeft,
      ROW_FRAME,
      CHILDREN,
      REAL_POSITIONS,
      0,
      2,
      null,
      DRAGGED_SIZE,
      { x: 0, y: 0 },
    );

    // result — index 0 within the row's own slice, with no padding applied
    expect(dropTarget.index).toBe(0);
    expect(dropTarget.indicator).toMatchObject({ x: 2, y: 2 });
  });

  it('should treat a single-item row as complete on its own, unaffected by children outside its slice', () => {
    // action — row is just ['3'] (realStart 2, realEnd 3); cursor lands after it
    const dropTarget = getAutoLayoutWrappedRowDropTarget(
      LayoutMode.horizontal,
      20,
      AlignmentLayout.topLeft,
      { height: 100, width: 250, x: 0, y: 120 },
      CHILDREN,
      REAL_POSITIONS,
      2,
      3,
      null,
      DRAGGED_SIZE,
      { x: 200, y: 120 },
    );

    // result — inserted after the row's own single child
    expect(dropTarget.index).toBe(1);
  });
});
