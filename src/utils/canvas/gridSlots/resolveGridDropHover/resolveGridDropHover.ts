// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridDropHover } from './types';
import { TGridTrackLayout } from '../getGridTrackLayout';
import { TPoint } from 'types/canvas';

// utils
import { getGridDropPlacements } from './getGridDropPlacements';
import { getGridOccupancyIndex } from './getGridOccupancyIndex';
import { getHoveredGridCell } from './getHoveredGridCell';
import { gridCellKey } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/gridCellKey';
import { resolveOccupiedCellHover } from './resolveOccupiedCellHover';
import { withGridSpanPreview } from './withGridSpanPreview';

export const resolveGridDropHover = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  movedNodeIds: string[],
  framePoint: TPoint,
  layout: TGridTrackLayout,
): TGridDropHover => {
  const count = Math.max(movedNodeIds.length, 1);
  const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);
  const hasTracks = sum(layout.columnSizes) > 0 && sum(layout.rowSizes) > 0;
  const context = { count, frame, movedNodeIds, nodesById };

  const resolve = (): TGridDropHover => {
    if (hasTracks) {
      const cell = getHoveredGridCell(framePoint, layout);
      const occupancy = getGridOccupancyIndex(context, layout.columnCount);

      if (occupancy.occupied.has(gridCellKey(cell.row, cell.column))) {
        return resolveOccupiedCellHover(context, layout, framePoint, cell, occupancy);
      }

      return { cells: getGridDropPlacements(frame, nodesById, movedNodeIds, cell, count) };
    }

    return { cells: getGridDropPlacements(frame, nodesById, movedNodeIds, { column: 0, row: 0 }, count) };
  };

  return withGridSpanPreview(resolve(), context, layout.columnCount);
};
