// types
import { TDraftRect } from 'types/canvas';

export const getReadingOrderCounterEnd = (isHorizontal: boolean, bounds: TDraftRect): number =>
  isHorizontal ? bounds.y + bounds.height : bounds.x + bounds.width;
