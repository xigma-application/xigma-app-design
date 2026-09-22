// types
import { TDraftRect, TPoint } from 'types/canvas';

export const toSvgPagePoint = (point: TPoint, bounds: TDraftRect): TPoint => ({
  x: point.x - bounds.x,
  y: point.y - bounds.y,
});
