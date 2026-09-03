// types
import { TDraftRect } from 'types/canvas';
import { TGridGeometry } from 'types/design/smartSelection/types';

export const getGridCellRect = (geometry: TGridGeometry, rowIndex: number, columnIndex: number): TDraftRect => ({
  height: geometry.rowHeight[rowIndex],
  width: geometry.columnWidth[columnIndex],
  x: geometry.columnX[columnIndex],
  y: geometry.rowY[rowIndex],
});
