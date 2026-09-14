// types
import { TDraftRect, TPoint } from 'types/canvas';

export type TRectEdge = 'bottom' | 'left' | 'right' | 'top';

const getTouchedVerticalEdges = (withinY: boolean, point: TPoint, left: number, right: number, tolerance: number): TRectEdge[] => {
  if (withinY) {
    const leftEdge = Math.abs(point.x - left) <= tolerance ? 'left' : null;
    const rightEdge = Math.abs(point.x - right) <= tolerance ? 'right' : null;

    return [leftEdge, rightEdge].filter((edge): edge is TRectEdge => edge !== null);
  }

  return [];
};

const getTouchedHorizontalEdges = (withinX: boolean, point: TPoint, top: number, bottom: number, tolerance: number): TRectEdge[] => {
  if (withinX) {
    const topEdge = Math.abs(point.y - top) <= tolerance ? 'top' : null;
    const bottomEdge = Math.abs(point.y - bottom) <= tolerance ? 'bottom' : null;

    return [topEdge, bottomEdge].filter((edge): edge is TRectEdge => edge !== null);
  }

  return [];
};

export const getTouchedRectEdges = (point: TPoint, bounds: TDraftRect, tolerance: number): Set<TRectEdge> => {
  const left = bounds.x;
  const right = bounds.x + bounds.width;
  const top = bounds.y;
  const bottom = bounds.y + bounds.height;
  const withinX = point.x >= left - tolerance && point.x <= right + tolerance;
  const withinY = point.y >= top - tolerance && point.y <= bottom + tolerance;
  const edges = new Set<TRectEdge>();

  getTouchedVerticalEdges(withinY, point, left, right, tolerance).forEach((edge) => edges.add(edge));
  getTouchedHorizontalEdges(withinX, point, top, bottom, tolerance).forEach((edge) => edges.add(edge));

  return edges;
};
