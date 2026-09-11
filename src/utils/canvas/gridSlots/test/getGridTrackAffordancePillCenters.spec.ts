// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TGridTrackLayout } from '../getGridTrackLayout';

// utils
import { getGridTrackAffordancePillCenters } from '../getGridTrackAffordancePillCenters';

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'frame-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 10,
  y: 20,
};

const layout: TGridTrackLayout = {
  columnCount: 3,
  columnGap: 0,
  columnSizes: [100, 100, 100],
  padding: { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
  rowCount: 1,
  rowGap: 0,
  rowSizes: [200],
};

describe('getGridTrackAffordancePillCenters', () => {
  it('should center the column pill above the hovered column track and offset above the frame', () => {
    const centers = getGridTrackAffordancePillCenters(frame, layout, { column: 1, row: 0 }, 40);

    expect(centers.column).toEqual({ x: 10 + 100 + 50, y: 20 - 40 });
  });

  it('should center the row pill left of the hovered row track and offset left of the frame', () => {
    const centers = getGridTrackAffordancePillCenters(frame, layout, { column: 0, row: 0 }, 40);

    expect(centers.row).toEqual({ x: 10 - 40, y: 20 + 100 });
  });

  it('should account for left/top padding and column/row gap when locating the tracks', () => {
    const paddedLayout: TGridTrackLayout = {
      ...layout,
      columnGap: 10,
      padding: { paddingBottom: 5, paddingLeft: 5, paddingRight: 5, paddingTop: 8 },
      rowGap: 10,
    };

    const centers = getGridTrackAffordancePillCenters(frame, paddedLayout, { column: 1, row: 0 }, 40);

    expect(centers.column).toEqual({ x: 10 + 5 + 110 + 50, y: 20 - 40 });
    expect(centers.row).toEqual({ x: 10 - 40, y: 20 + 8 + 100 });
  });

  it('should fall back to the cumulative offset with no half-track width when the hovered index has no resolved track size', () => {
    const centers = getGridTrackAffordancePillCenters(frame, layout, { column: 9, row: 9 }, 40);

    expect(centers.column.x).toBeCloseTo(10 + 300, 5);
    expect(centers.row.y).toBeCloseTo(20 + 200, 5);
  });
});
