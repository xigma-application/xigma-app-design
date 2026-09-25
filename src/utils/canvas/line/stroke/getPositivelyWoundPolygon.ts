// types
import { TPoint } from 'types/canvas';

export const getPositivelyWoundPolygon = (polygon: TPoint[]): TPoint[] => {
  const doubleArea = polygon.reduce((sum, point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0);

  return doubleArea < 0 ? [...polygon].reverse() : polygon;
};
