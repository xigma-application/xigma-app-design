// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { areGapsUniform } from './areGapsUniform';
import { getAdjacentGapValue } from './getAdjacentGapValue';

export const getGridColumnGapValues = (cells: TSmartSelectionNode[][], toleranceWorldUnits: number): number[] | null => {
  const [firstRow] = cells;
  const values: number[] = [];

  for (let columnIndex = 0; columnIndex < firstRow.length - 1; columnIndex += 1) {
    const gap = getAdjacentGapValue(firstRow[columnIndex].bounds, firstRow[columnIndex + 1].bounds, 'x');

    if (gap < 0) {
      return null;
    }

    values.push(gap);
  }

  return areGapsUniform(values, toleranceWorldUnits) ? values : null;
};
