// types
import { TLineBox, TLinePoints } from './types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

const PRECISION = 1e6;

const round = (value: number): number => Math.round(value * PRECISION) / PRECISION + 0;

export const getLinePoints = ({ rotation, width, x, y }: TLineBox): TLinePoints => {
  const center = { x: x + width / 2, y };
  const start = rotatePoint({ x, y }, center, rotation);
  const end = rotatePoint({ x: x + width, y }, center, rotation);

  return { x1: round(start.x), x2: round(end.x), y1: round(start.y), y2: round(end.y) };
};
