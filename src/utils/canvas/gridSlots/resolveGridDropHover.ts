// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridDropCell } from './getGridDropCell';
import { TGridTrackLayout } from './getGridTrackLayout';
import { TPoint } from 'types/canvas';

// utils
import { getGridDropPlacements } from './getGridDropPlacements';
import { getGridPlacementInputs } from 'store/design/utils/autoLayout/getGridPlacementInputs';
import { gridCellKey } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/gridCellKey';
import { occupyGridRegion } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/occupyGridRegion';
import { placeGridCells } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/placeGridCells';

export type TGridDropHover = {
  cells: TGridDropCell[];
  indicator?: { column: number; row: number; side: 'left' | 'right' };
  insertIndex?: number;
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const resolveGridDropHover = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  movedNodeIds: string[],
  framePoint: TPoint,
  layout: TGridTrackLayout,
): TGridDropHover => {
  const count = Math.max(movedNodeIds.length, 1);
  const columnStride = layout.columnSize + layout.columnGap;
  const rowStride = layout.rowSize + layout.rowGap;

  if (columnStride > 0 && rowStride > 0) {
    const column = clamp(Math.floor((framePoint.x - layout.padding.paddingLeft) / columnStride), 0, layout.columnCount - 1);
    const row = Math.max(Math.floor((framePoint.y - layout.padding.paddingTop) / rowStride), 0);

    const occupied = new Set<string>();
    const inputs = getGridPlacementInputs(frame.childIds, nodesById, new Set(movedNodeIds));

    placeGridCells(inputs, layout.columnCount, frame.gridAutoPlacement ?? true).forEach((placement) => {
      occupyGridRegion(occupied, placement.rowStart, placement.columnStart, placement.columnSpan, placement.rowSpan);
    });

    if (occupied.has(gridCellKey(row, column))) {
      const cellLeft = layout.padding.paddingLeft + column * columnStride;
      const isLeftHalf = framePoint.x - cellLeft < layout.columnSize / 2;
      const neighborColumn = isLeftHalf ? column - 1 : column + 1;
      const neighborInRange = neighborColumn >= 0 && neighborColumn < layout.columnCount;

      if (neighborInRange && !occupied.has(gridCellKey(row, neighborColumn))) {
        return { cells: getGridDropPlacements(frame, nodesById, movedNodeIds, { column: neighborColumn, row }, count) };
      }

      return {
        cells: [],
        indicator: { column, row, side: isLeftHalf ? 'left' : 'right' },
        insertIndex: row * layout.columnCount + column + (isLeftHalf ? 0 : 1),
      };
    }

    return { cells: getGridDropPlacements(frame, nodesById, movedNodeIds, { column, row }, count) };
  }

  return { cells: getGridDropPlacements(frame, nodesById, movedNodeIds, { column: 0, row: 0 }, count) };
};
