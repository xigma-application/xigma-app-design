// types
import { TPoint } from 'types/canvas';

export const getVectorFaceSignedArea = (points: TPoint[]): number =>
  points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length];

    return sum + (point.x * next.y - next.x * point.y);
  }, 0);
