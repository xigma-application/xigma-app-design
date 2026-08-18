// types
import { TDraftRect, TPoint } from 'types/canvas';

export const toDraftRect = (start: TPoint, current: TPoint): TDraftRect => {
  const left = Math.round(Math.min(start.x, current.x));
  const right = Math.round(Math.max(start.x, current.x));
  const top = Math.round(Math.min(start.y, current.y));
  const bottom = Math.round(Math.max(start.y, current.y));

  return { height: bottom - top, width: right - left, x: left, y: top };
};
