// types
import { TDraftRect } from 'types/canvas';

export const getReadingOrderCounterStart = (isHorizontal: boolean, bounds: TDraftRect): number => (isHorizontal ? bounds.y : bounds.x);
