// types
import { TSmartSelectionGridLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { buildGridCells } from './buildGridCells';
import { buildGridColumnGaps } from './buildGridColumnGaps';
import { buildGridRowGaps } from './buildGridRowGaps';
import { getGridColumnGapValues } from './getGridColumnGapValues';
import { getGridExtent } from './getGridExtent';
import { getGridRowGapValues } from './getGridRowGapValues';
import { groupIntoHorizontalBands } from './groupIntoHorizontalBands';
import { groupIntoVerticalBands } from './groupIntoVerticalBands';
import { isGridAligned } from './isGridAligned';

export const detectGridLayout = (
  nodes: TSmartSelectionNode[],
  alignmentToleranceWorldUnits: number,
  gapToleranceWorldUnits: number,
): TSmartSelectionGridLayout | null => {
  const cells = buildGridCells(nodes, groupIntoHorizontalBands(nodes), groupIntoVerticalBands(nodes));

  if (cells && isGridAligned(cells, alignmentToleranceWorldUnits)) {
    const columnGapValues = getGridColumnGapValues(cells, gapToleranceWorldUnits);
    const rowGapValues = getGridRowGapValues(cells, gapToleranceWorldUnits);

    if (columnGapValues && rowGapValues) {
      const extent = getGridExtent(cells);
      const firstColumn = cells.map((row) => row[0]);

      return {
        cells,
        columnCount: cells[0].length,
        columnGaps: buildGridColumnGaps(cells, columnGapValues, extent),
        rowCount: cells.length,
        rowGaps: buildGridRowGaps(firstColumn, rowGapValues, extent),
        type: 'grid',
      };
    }
  }

  return null;
};
