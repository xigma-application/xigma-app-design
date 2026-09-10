// types
import { TFrameNode } from 'types/design/types';
import { TGridTrackLayout } from '../getGridTrackLayout';

// utils
import { getGridInsertIndicatorRect } from '../getGridInsertIndicatorRect';

const layout: TGridTrackLayout = {
  columnCount: 3,
  columnGap: 10,
  columnSize: 40,
  padding: { paddingBottom: 8, paddingLeft: 8, paddingRight: 8, paddingTop: 6 },
  rowCount: 2,
  rowGap: 12,
  rowSize: 30,
};

const frame = { width: 156, x: 100, y: 200 } as TFrameNode;

describe('getGridInsertIndicatorRect', () => {
  it('should sit in the middle of the gap on the left side of the cell', () => {
    // result — cell 1 starts at 100 + 8 + 50 = 158; half the 10px gap and half the 3px bar back off it
    expect(getGridInsertIndicatorRect(layout, frame, { column: 1, row: 0, side: 'left' })).toEqual({
      height: 30,
      width: 3,
      x: 158 - 5 - 1.5,
      y: 206,
    });
  });

  it('should clamp to the content edge when inserting against the left wall', () => {
    // result — column 0, left side would land in the padding, so it pins to the content-left edge
    expect(getGridInsertIndicatorRect(layout, frame, { column: 0, row: 1, side: 'left' })).toEqual({
      height: 30,
      width: 3,
      x: 108 - 1.5,
      y: 206 + 42,
    });
  });

  it('should clamp to the content edge when inserting against the right wall', () => {
    // result — last column, right side pins to the content-right edge (100 + 156 - 8)
    expect(getGridInsertIndicatorRect(layout, frame, { column: 2, row: 0, side: 'right' })).toEqual({
      height: 30,
      width: 3,
      x: 248 - 1.5,
      y: 206,
    });
  });
});
