// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { toSvgPagePoint } from './toSvgPagePoint';

export type TSvgGradientGeometry = {
  direction: TPoint;
  end: TPoint;
  perpendicular: TPoint;
  primaryRadius: number;
  start: TPoint;
};

const toWorldPoint = (fillBounds: TDraftRect, normalized: TPoint): TPoint => ({
  x: fillBounds.x + normalized.x * fillBounds.width,
  y: fillBounds.y + normalized.y * fillBounds.height,
});

export const getSvgGradientGeometry = (paint: TGradientPaint, fillBounds: TDraftRect, pageBounds: TDraftRect): TSvgGradientGeometry => {
  const start = toSvgPagePoint(toWorldPoint(fillBounds, paint.start), pageBounds);
  const end = toSvgPagePoint(toWorldPoint(fillBounds, paint.end), pageBounds);
  const axis: TPoint = { x: end.x - start.x, y: end.y - start.y };
  const primaryRadius = Math.hypot(axis.x, axis.y);
  const direction: TPoint = primaryRadius > 0 ? { x: axis.x / primaryRadius, y: axis.y / primaryRadius } : { x: 1, y: 0 };
  const perpendicular: TPoint = { x: -direction.y, y: direction.x };

  return { direction, end, perpendicular, primaryRadius, start };
};
