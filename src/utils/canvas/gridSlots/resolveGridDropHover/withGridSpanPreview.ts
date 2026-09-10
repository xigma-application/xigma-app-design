// types
import { TGridDropCell } from '../getGridDropCell';
import { TGridDropContext, TGridDropHover } from './types';

// utils
import { getGridFootprintCells } from './getGridFootprintCells';
import { getGridOccupancyIndex } from './getGridOccupancyIndex';
import { getGridPlacementInputs } from 'store/design/utils/autoLayout/getGridPlacementInputs';
import { gridCellKey } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/gridCellKey';

export const withGridSpanPreview = (hover: TGridDropHover, context: TGridDropContext, columnCount: number): TGridDropHover => {
  if (!hover.indicator && hover.cells.length > 0 && hover.cells.length === context.movedNodeIds.length) {
    const spanById = new Map(
      getGridPlacementInputs(context.movedNodeIds, context.nodesById).map((input) => [
        input.id,
        { columnSpan: Math.max(Math.round(input.gridColumnSpan ?? 1), 1), rowSpan: Math.max(Math.round(input.gridRowSpan ?? 1), 1) },
      ]),
    );

    if ([...spanById.values()].some(({ columnSpan, rowSpan }) => columnSpan > 1 || rowSpan > 1)) {
      const { occupied } = getGridOccupancyIndex(context, columnCount);
      const seen = new Set<string>();
      const previewCells: TGridDropCell[] = [];

      context.movedNodeIds.forEach((id, index) => {
        const { columnSpan, rowSpan } = spanById.get(id) ?? { columnSpan: 1, rowSpan: 1 };

        getGridFootprintCells(hover.cells[index], columnSpan, rowSpan, columnCount).forEach((cell) => {
          const key = gridCellKey(cell.row, cell.column);

          if (!seen.has(key) && !occupied.has(key)) {
            seen.add(key);
            previewCells.push(cell);
          }
        });
      });

      return { ...hover, previewCells };
    }
  }

  return hover;
};
