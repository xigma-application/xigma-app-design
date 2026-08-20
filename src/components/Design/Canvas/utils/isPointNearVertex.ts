// types
import { TPoint } from 'types/canvas';
import { TVectorVertex } from 'types/design/types';

export const isPointNearVertex = (point: TPoint, vertex: TVectorVertex, tolerance: number): boolean =>
  Math.hypot(point.x - vertex.x, point.y - vertex.y) <= tolerance;
