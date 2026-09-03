// types
import { TGridGeometry } from 'types/design/smartSelection/types';

// utils
import { areGapsUniform } from './areGapsUniform';

export const getRawGridRowGapValues = (geometry: TGridGeometry): number[] | null => {
  const values: number[] = [];

  for (let rowIndex = 0; rowIndex < geometry.rowY.length - 1; rowIndex += 1) {
    const gap = geometry.rowY[rowIndex + 1] - (geometry.rowY[rowIndex] + geometry.rowHeight[rowIndex]);

    if (gap < 0) {
      return null;
    }

    values.push(gap);
  }

  return values;
};

export const getGridRowGapValues = (geometry: TGridGeometry, toleranceWorldUnits: number): number[] | null => {
  const values = getRawGridRowGapValues(geometry);
  return values && areGapsUniform(values, toleranceWorldUnits) ? values : null;
};
