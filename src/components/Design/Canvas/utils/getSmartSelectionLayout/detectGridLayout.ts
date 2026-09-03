// types
import { TSmartSelectionGridLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { buildGridCells } from './buildGridCells';
import { buildGridColumnGaps } from './buildGridColumnGaps';
import { buildGridRowGaps } from './buildGridRowGaps';
import { getGridColumnGapValues } from './getGridColumnGapValues';
import { getGridExtent } from './getGridExtent';
import { getGridGeometry } from './getGridGeometry';
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

  if (cells) {
    const geometry = getGridGeometry(cells);

    if (isGridAligned(cells, geometry, alignmentToleranceWorldUnits)) {
      const columnGapValues = getGridColumnGapValues(geometry, gapToleranceWorldUnits);
      const rowGapValues = getGridRowGapValues(geometry, gapToleranceWorldUnits);

      if (columnGapValues && rowGapValues) {
        const extent = getGridExtent(cells);

        return {
          cells,
          columnCount: cells[0].length,
          columnGaps: buildGridColumnGaps(cells, geometry, columnGapValues, extent),
          geometry,
          rowCount: cells.length,
          rowGaps: buildGridRowGaps(geometry, rowGapValues, extent),
          type: 'grid',
        };
      }
    }
  }

  return null;
};
