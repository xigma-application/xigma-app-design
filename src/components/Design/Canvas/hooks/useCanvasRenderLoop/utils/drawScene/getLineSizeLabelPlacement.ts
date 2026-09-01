// types
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export type TLineSizeLabelPlacement = {
  anchor: TPoint;
  angleDeg: number;
  offsetDirection: TPoint;
};

const ORIGIN: TPoint = { x: 0, y: 0 };

export const getLineSizeLabelPlacement = (x1: number, y1: number, x2: number, y2: number): TLineSizeLabelPlacement => {
  const anchor: TPoint = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  const rawAngleDeg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const wrappedAngleDeg = ((rawAngleDeg % 180) + 180) % 180;
  const angleDeg = wrappedAngleDeg > 90 ? wrappedAngleDeg - 180 : wrappedAngleDeg;
  const offsetDirection = rotatePoint({ x: 0, y: 1 }, ORIGIN, angleDeg);

  return { anchor, angleDeg, offsetDirection };
};
