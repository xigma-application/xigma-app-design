// types
import { TDraftRect } from 'types/canvas';
import { TGridCellPlacement } from './types';

export const getGridCellRect = (
  placement: TGridCellPlacement,
  columnOffsets: number[],
  rowOffsets: number[],
  columnSizes: number[],
  rowSizes: number[],
): TDraftRect => {
  const lastColumn = placement.columnStart + placement.columnSpan - 1;
  const lastRow = placement.rowStart + placement.rowSpan - 1;
  const x = columnOffsets[placement.columnStart] ?? 0;
  const y = rowOffsets[placement.rowStart] ?? 0;
  const right = (columnOffsets[lastColumn] ?? x) + (columnSizes[lastColumn] ?? 0);
  const bottom = (rowOffsets[lastRow] ?? y) + (rowSizes[lastRow] ?? 0);

  return { height: Math.max(bottom - y, 0), width: Math.max(right - x, 0), x, y };
};
