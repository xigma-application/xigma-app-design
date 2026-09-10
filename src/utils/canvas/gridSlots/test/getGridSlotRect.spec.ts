// types
import { TGridTrackLayout } from '../getGridTrackLayout';
import { TFrameNode } from 'types/design/types';

// utils
import { getGridSlotRect } from '../getGridSlotRect';

const layout: TGridTrackLayout = {
  columnCount: 3,
  columnGap: 10,
  columnSizes: [40, 40, 40],
  padding: { paddingBottom: 5, paddingLeft: 8, paddingRight: 8, paddingTop: 6 },
  rowCount: 2,
  rowGap: 12,
  rowSizes: [30, 30],
};

const frame = { x: 100, y: 200 } as TFrameNode;

describe('getGridSlotRect', () => {
  it('should place the first cell at the padded frame origin', () => {
    // result
    expect(getGridSlotRect(layout, frame, 0, 0)).toEqual({ height: 30, width: 40, x: 108, y: 206 });
  });

  it('should offset later columns and rows by their track size plus gap', () => {
    // result
    expect(getGridSlotRect(layout, frame, 2, 1)).toEqual({ height: 30, width: 40, x: 108 + 2 * 50, y: 206 + 42 });
  });

  it('should give a zero size to a row/column index past the resolved tracks', () => {
    // row 5 does not exist in a 2-row layout — the grid grows on drop, the rect just has no height
    expect(getGridSlotRect(layout, frame, 5, 5)).toMatchObject({ height: 0, width: 0 });
  });

  it('should use each track’s own size and cumulative offset for non-uniform tracks', () => {
    // before
    const nonUniform: TGridTrackLayout = { ...layout, columnGap: 0, columnSizes: [20, 60, 100], rowGap: 0, rowSizes: [10, 90] };

    // result — column 2 sits after 20 + 60, row 1 after 10
    expect(getGridSlotRect(nonUniform, frame, 2, 1)).toEqual({ height: 90, width: 100, x: 100 + 8 + 80, y: 200 + 6 + 10 });
  });
});
