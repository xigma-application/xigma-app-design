// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { toPdfPagePoint } from './toPdfPagePoint';

export type TPdfGradientGeometry = {
  direction: TPoint;
  endPage: TPoint;
  perpendicular: TPoint;
  primaryRadius: number;
  startPage: TPoint;
};

const toWorldPoint = (fillBounds: TDraftRect, normalized: TPoint): TPoint => ({
  x: fillBounds.x + normalized.x * fillBounds.width,
  y: fillBounds.y + normalized.y * fillBounds.height,
});

export const getPdfGradientGeometry = (paint: TGradientPaint, fillBounds: TDraftRect, pageBounds: TDraftRect): TPdfGradientGeometry => {
  const startPage = toPdfPagePoint(toWorldPoint(fillBounds, paint.start), pageBounds);
  const endPage = toPdfPagePoint(toWorldPoint(fillBounds, paint.end), pageBounds);
  const axis: TPoint = { x: endPage.x - startPage.x, y: endPage.y - startPage.y };
  const primaryRadius = Math.hypot(axis.x, axis.y);
  const direction: TPoint = primaryRadius > 0 ? { x: axis.x / primaryRadius, y: axis.y / primaryRadius } : { x: 1, y: 0 };
  const perpendicular: TPoint = { x: -direction.y, y: direction.x };

  return { direction, endPage, perpendicular, primaryRadius, startPage };
};
