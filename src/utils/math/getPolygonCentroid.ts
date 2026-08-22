// types
import { TPoint } from 'types/canvas';

export const getPolygonCentroid = (points: TPoint[]): TPoint => ({
  x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
  y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
});
