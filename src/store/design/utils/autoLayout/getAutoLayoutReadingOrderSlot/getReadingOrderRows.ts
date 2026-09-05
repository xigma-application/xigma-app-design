// types
import { TDraftRect } from 'types/canvas';

// utils
import { getReadingOrderCounterEnd } from './getReadingOrderCounterEnd';
import { getReadingOrderCounterStart } from './getReadingOrderCounterStart';

export const getReadingOrderRows = (isHorizontal: boolean, childBounds: TDraftRect[]): TDraftRect[][] =>
  childBounds.reduce<TDraftRect[][]>((grouped, bounds) => {
    const currentRow = grouped[grouped.length - 1];

    if (currentRow) {
      const rowThickness =
        getReadingOrderCounterEnd(isHorizontal, currentRow[0]) - getReadingOrderCounterStart(isHorizontal, currentRow[0]);

      if (
        getReadingOrderCounterStart(isHorizontal, bounds) - getReadingOrderCounterStart(isHorizontal, currentRow[0]) <=
        rowThickness / 2
      ) {
        currentRow.push(bounds);
        return grouped;
      }
    }

    grouped.push([bounds]);

    return grouped;
  }, []);
