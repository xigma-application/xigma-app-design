// types
import { TPoint } from 'types/canvas';

// others
import { DEGREES_TO_RADIANS } from './constants';

export const getStampAngle = (tangent: TPoint, rotation: number, angularJitter: number, random: () => number): number =>
  Math.atan2(tangent.y, tangent.x) + (rotation + (random() * 2 - 1) * angularJitter) * DEGREES_TO_RADIANS;
