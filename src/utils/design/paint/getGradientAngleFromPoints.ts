// types
import { TPoint } from 'types/canvas';

export const getGradientAngleFromPoints = (start: TPoint, end: TPoint): number =>
  (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;
