// types
import { TDraftRect, TPoint } from 'types/canvas';

export const toDraftRect = (start: TPoint, current: TPoint): TDraftRect => ({
  height: Math.abs(current.y - start.y),
  width: Math.abs(current.x - start.x),
  x: Math.min(start.x, current.x),
  y: Math.min(start.y, current.y),
});
