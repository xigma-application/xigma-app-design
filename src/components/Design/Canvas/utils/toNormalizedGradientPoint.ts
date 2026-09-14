// types
import { TDraftRect, TPoint } from 'types/canvas';

export const toNormalizedGradientPoint = (point: TPoint, bounds: TDraftRect): TPoint => ({
  x: (point.x - bounds.x) / bounds.width,
  y: (point.y - bounds.y) / bounds.height,
});
