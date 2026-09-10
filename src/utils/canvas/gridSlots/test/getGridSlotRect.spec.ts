// types
import { TGridTrackLayout } from '../getGridTrackLayout';
import { TFrameNode } from 'types/design/types';

// utils
import { getGridSlotRect } from '../getGridSlotRect';

const layout: TGridTrackLayout = {
  columnCount: 3,
  columnGap: 10,
  columnSize: 40,
  padding: { paddingBottom: 5, paddingLeft: 8, paddingRight: 8, paddingTop: 6 },
  rowCount: 2,
  rowGap: 12,
  rowSize: 30,
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
});
