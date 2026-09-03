// types
import { TSmartSelectionGridEqualizeSuggestion, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { areGapsUniform } from './getSmartSelectionLayout/areGapsUniform';
import { buildGridCells } from './getSmartSelectionLayout/buildGridCells';
import { buildGridColumnGaps } from './getSmartSelectionLayout/buildGridColumnGaps';
import { buildGridRowGaps } from './getSmartSelectionLayout/buildGridRowGaps';
import { getGridExtent } from './getSmartSelectionLayout/getGridExtent';
import { getGridGeometry } from './getSmartSelectionLayout/getGridGeometry';
import { getRawGridColumnGapValues } from './getSmartSelectionLayout/getGridColumnGapValues';
import { getRawGridRowGapValues } from './getSmartSelectionLayout/getGridRowGapValues';
import { groupIntoHorizontalBands } from './getSmartSelectionLayout/groupIntoHorizontalBands';
import { groupIntoVerticalBands } from './getSmartSelectionLayout/groupIntoVerticalBands';
import { isGridAligned } from './getSmartSelectionLayout/isGridAligned';

export const getSmartSelectionGridEqualizeSuggestion = (
  nodes: TSmartSelectionNode[],
  alignmentTolerance: number,
  gapTolerance: number,
): TSmartSelectionGridEqualizeSuggestion | null => {
  const cells = buildGridCells(nodes, groupIntoHorizontalBands(nodes), groupIntoVerticalBands(nodes));

  if (cells) {
    const geometry = getGridGeometry(cells);

    if (isGridAligned(cells, geometry, alignmentTolerance)) {
      const columnGapValues = getRawGridColumnGapValues(geometry);
      const rowGapValues = getRawGridRowGapValues(geometry);
      const columnsUniform = columnGapValues && areGapsUniform(columnGapValues, gapTolerance);
      const rowsUniform = rowGapValues && areGapsUniform(rowGapValues, gapTolerance);

      if (columnGapValues && rowGapValues && (!columnsUniform || !rowsUniform)) {
        const extent = getGridExtent(cells);

        return {
          columnGapValues,
          layout: {
            cells,
            columnCount: cells[0].length,
            columnGaps: buildGridColumnGaps(cells, geometry, columnGapValues, extent),
            geometry,
            rowCount: cells.length,
            rowGaps: buildGridRowGaps(geometry, rowGapValues, extent),
            type: 'grid',
          },
          rowGapValues,
          type: 'grid-equalize',
        };
      }
    }
  }

  return null;
};
