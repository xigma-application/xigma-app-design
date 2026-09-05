// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getReadingOrderCounterEnd } from './getReadingOrderCounterEnd';
import { getReadingOrderCounterStart } from './getReadingOrderCounterStart';
import { getReadingOrderPrimaryEnd } from './getReadingOrderPrimaryEnd';

export const getReadingOrderSlotFromRows = (isHorizontal: boolean, rows: TDraftRect[][], cursorPoint: TPoint): number => {
  const cursorCounter = isHorizontal ? cursorPoint.y : cursorPoint.x;
  const cursorPrimary = isHorizontal ? cursorPoint.x : cursorPoint.y;

  return rows.reduce((slot, row) => {
    const bandStart = Math.min(...row.map((bounds) => getReadingOrderCounterStart(isHorizontal, bounds)));
    const bandEnd = Math.max(...row.map((bounds) => getReadingOrderCounterEnd(isHorizontal, bounds)));
    const isOnLaterRow = cursorCounter >= bandEnd;
    const isWithinRow = cursorCounter >= bandStart && cursorCounter < bandEnd;

    return (
      slot +
      row.filter((bounds) => isOnLaterRow || (isWithinRow && cursorPrimary >= getReadingOrderPrimaryEnd(isHorizontal, bounds))).length
    );
  }, 0);
};
