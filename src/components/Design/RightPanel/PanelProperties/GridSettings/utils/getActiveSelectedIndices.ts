// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export const getActiveSelectedIndices = (
  activeAxis: TGridTrackAxis | null,
  columnSelectedIndices: number[],
  rowSelectedIndices: number[],
): number[] => {
  switch (activeAxis) {
    case 'column':
      return columnSelectedIndices;
    case 'row':
      return rowSelectedIndices;
    default:
      return [];
  }
};
