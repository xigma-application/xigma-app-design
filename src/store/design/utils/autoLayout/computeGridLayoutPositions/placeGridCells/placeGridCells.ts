// types
import { TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TGridCellPlacement } from '../types';

// utils
import { clampSpan } from './clampSpan';
import { getAnchoredGridPlacement } from './getAnchoredGridPlacement';
import { getAutoFlowGridPlacement } from './getAutoFlowGridPlacement';
import { occupyGridRegion } from './occupyGridRegion';

export const placeGridCells = (children: TAutoLayoutChildSize[], columnCount: number, autoPlacement: boolean): TGridCellPlacement[] => {
  const columns = Math.max(Math.round(columnCount), 1);
  const occupied = new Set<string>();
  const cursor = { column: 0, row: 0 };

  return children.map((child) => {
    const columnSpan = clampSpan(child.gridColumnSpan, columns);
    const rowSpan = clampSpan(child.gridRowSpan, Number.MAX_SAFE_INTEGER);
    const hasAnchor = child.gridColumnAnchorIndex !== undefined && child.gridRowAnchorIndex !== undefined;
    const useAnchor = !autoPlacement && hasAnchor;
    const placement = useAnchor
      ? getAnchoredGridPlacement(child, columns, columnSpan, rowSpan)
      : getAutoFlowGridPlacement(child.id, columns, columnSpan, rowSpan, cursor, occupied);

    occupyGridRegion(occupied, placement.rowStart, placement.columnStart, columnSpan, rowSpan);

    return placement;
  });
};
