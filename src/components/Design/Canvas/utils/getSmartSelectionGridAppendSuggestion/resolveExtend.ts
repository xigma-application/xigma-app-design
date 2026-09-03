// types
import { TSmartSelectionGridLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';
import { TGridAppendTarget } from './types';

// utils
import { findOverlappingBandIndex } from './findOverlappingBandIndex';
import { getGridExtent } from '../getSmartSelectionLayout/getGridExtent';

export const resolveExtend = (outlier: TSmartSelectionNode, layout: TSmartSelectionGridLayout): TGridAppendTarget | null => {
  const { geometry } = layout;
  const extent = getGridExtent(layout.cells);
  const columnGapValue = layout.columnGaps[0]?.value ?? 0;
  const rowGapValue = layout.rowGaps[0]?.value ?? 0;
  const rowIndex = findOverlappingBandIndex(geometry.rowY, geometry.rowHeight, outlier.bounds.y, outlier.bounds.y + outlier.bounds.height);

  if (rowIndex !== -1) {
    const lastColumn = geometry.columnWidth.length - 1;
    const outlierCenterX = outlier.bounds.x + outlier.bounds.width / 2;
    const appendAfter = outlierCenterX >= (extent.left + extent.right) / 2;
    const edgeColumnWidth = appendAfter ? geometry.columnWidth[lastColumn] : geometry.columnWidth[0];
    const x = appendAfter ? extent.right + columnGapValue : extent.left - columnGapValue - edgeColumnWidth;

    return {
      column: appendAfter ? layout.columnCount : -1,
      height: geometry.rowHeight[rowIndex],
      row: rowIndex,
      width: edgeColumnWidth,
      x,
      y: geometry.rowY[rowIndex],
    };
  }

  const columnIndex = findOverlappingBandIndex(
    geometry.columnX,
    geometry.columnWidth,
    outlier.bounds.x,
    outlier.bounds.x + outlier.bounds.width,
  );

  if (columnIndex !== -1) {
    const lastRow = geometry.rowHeight.length - 1;
    const outlierCenterY = outlier.bounds.y + outlier.bounds.height / 2;
    const appendAfter = outlierCenterY >= (extent.top + extent.bottom) / 2;
    const edgeRowHeight = appendAfter ? geometry.rowHeight[lastRow] : geometry.rowHeight[0];
    const y = appendAfter ? extent.bottom + rowGapValue : extent.top - rowGapValue - edgeRowHeight;

    return {
      column: columnIndex,
      height: edgeRowHeight,
      row: appendAfter ? layout.rowCount : -1,
      width: geometry.columnWidth[columnIndex],
      x: geometry.columnX[columnIndex],
      y,
    };
  }

  return null;
};
