// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { areGapsUniform } from './areGapsUniform';
import { getAdjacentGapValue } from './getAdjacentGapValue';

export const getGridRowGapValues = (cells: TSmartSelectionNode[][], toleranceWorldUnits: number): number[] | null => {
  const values: number[] = [];

  for (let rowIndex = 0; rowIndex < cells.length - 1; rowIndex += 1) {
    const gap = getAdjacentGapValue(cells[rowIndex][0].bounds, cells[rowIndex + 1][0].bounds, 'y');

    if (gap < 0) {
      return null;
    }

    values.push(gap);
  }

  return areGapsUniform(values, toleranceWorldUnits) ? values : null;
};
