// types
import { TGridCellPlacement, TGridPlacementInput } from '../types';

export const getAnchoredGridPlacement = (
  child: TGridPlacementInput,
  columns: number,
  columnSpan: number,
  rowSpan: number,
): TGridCellPlacement => {
  const columnStart = Math.min(Math.max(Math.round(child.gridColumnAnchorIndex as number), 0), columns - columnSpan);
  const rowStart = Math.max(Math.round(child.gridRowAnchorIndex as number), 0);

  return { columnSpan, columnStart, id: child.id, rowSpan, rowStart };
};
