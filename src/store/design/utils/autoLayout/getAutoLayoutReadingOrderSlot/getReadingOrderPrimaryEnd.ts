// types
import { TDraftRect } from 'types/canvas';

export const getReadingOrderPrimaryEnd = (isHorizontal: boolean, bounds: TDraftRect): number =>
  isHorizontal ? bounds.x + bounds.width : bounds.y + bounds.height;
