// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getReadingOrderRows } from './getReadingOrderRows';
import { getReadingOrderSlotFromRows } from './getReadingOrderSlotFromRows';

export const getAutoLayoutReadingOrderSlot = (isHorizontal: boolean, childBounds: TDraftRect[], cursorPoint: TPoint): number => {
  const rows = getReadingOrderRows(isHorizontal, childBounds);
  return getReadingOrderSlotFromRows(isHorizontal, rows, cursorPoint);
};
