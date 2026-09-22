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

export const getPdfGradientGeometry = (paint: TGradientPaint, bounds: TDraftRect): TPdfGradientGeometry => {
  const startPage = toPdfPagePoint(paint.start, bounds);
  const endPage = toPdfPagePoint(paint.end, bounds);
  const axis: TPoint = { x: endPage.x - startPage.x, y: endPage.y - startPage.y };
  const primaryRadius = Math.hypot(axis.x, axis.y);
  const direction: TPoint = primaryRadius > 0 ? { x: axis.x / primaryRadius, y: axis.y / primaryRadius } : { x: 1, y: 0 };
  const perpendicular: TPoint = { x: -direction.y, y: direction.x };

  return { direction, endPage, perpendicular, primaryRadius, startPage };
};
