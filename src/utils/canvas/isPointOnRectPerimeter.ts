// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getTouchedRectEdges } from './getTouchedRectEdges';

export const isPointOnRectPerimeter = (point: TPoint, bounds: TDraftRect, tolerance: number): boolean =>
  getTouchedRectEdges(point, bounds, tolerance).size > 0;
