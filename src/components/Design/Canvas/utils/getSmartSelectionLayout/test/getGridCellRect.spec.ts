// types
import { TGridGeometry } from 'types/design/smartSelection/types';

// utils
import { getGridCellRect } from '../getGridCellRect';

const GEOMETRY: TGridGeometry = { columnWidth: [50, 80], columnX: [0, 100], rowHeight: [40, 60], rowY: [0, 100] };

describe('getGridCellRect', () => {
  it('should build a rect for any grid position from the per-column / per-row geometry', () => {
    expect(getGridCellRect(GEOMETRY, 0, 0)).toEqual({ height: 40, width: 50, x: 0, y: 0 });
    expect(getGridCellRect(GEOMETRY, 1, 1)).toEqual({ height: 60, width: 80, x: 100, y: 100 });
    expect(getGridCellRect(GEOMETRY, 0, 1)).toEqual({ height: 40, width: 80, x: 100, y: 0 });
  });
});
