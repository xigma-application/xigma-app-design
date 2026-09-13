// types
import { TPoint } from 'types/canvas';

const POINTS_BY_ANGLE: Record<number, { end: TPoint; start: TPoint }> = {
  0: { end: { x: 1, y: 0.5 }, start: { x: 0, y: 0.5 } },
  180: { end: { x: 0, y: 0.5 }, start: { x: 1, y: 0.5 } },
  270: { end: { x: 0.5, y: 0 }, start: { x: 0.5, y: 1 } },
  90: { end: { x: 0.5, y: 1 }, start: { x: 0.5, y: 0 } },
};

export const getGradientPointsFromAngle = (angle: number): { end: TPoint; start: TPoint } =>
  POINTS_BY_ANGLE[((angle % 360) + 360) % 360] ?? POINTS_BY_ANGLE[0];
