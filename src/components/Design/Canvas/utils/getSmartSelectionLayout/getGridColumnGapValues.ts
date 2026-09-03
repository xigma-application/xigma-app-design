// types
import { TGridGeometry } from 'types/design/smartSelection/types';

// utils
import { areGapsUniform } from './areGapsUniform';

export const getRawGridColumnGapValues = (geometry: TGridGeometry): number[] | null => {
  const values: number[] = [];

  for (let columnIndex = 0; columnIndex < geometry.columnX.length - 1; columnIndex += 1) {
    const gap = geometry.columnX[columnIndex + 1] - (geometry.columnX[columnIndex] + geometry.columnWidth[columnIndex]);

    if (gap < 0) {
      return null;
    }

    values.push(gap);
  }

  return values;
};

export const getGridColumnGapValues = (geometry: TGridGeometry, toleranceWorldUnits: number): number[] | null => {
  const values = getRawGridColumnGapValues(geometry);

  return values && areGapsUniform(values, toleranceWorldUnits) ? values : null;
};
