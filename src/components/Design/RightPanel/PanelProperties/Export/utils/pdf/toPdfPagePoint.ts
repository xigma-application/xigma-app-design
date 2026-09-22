// types
import { TDraftRect, TPoint } from 'types/canvas';

export const toPdfPagePoint = (point: TPoint, bounds: TDraftRect): TPoint => ({
  x: point.x - bounds.x,
  y: bounds.height - (point.y - bounds.y),
});
