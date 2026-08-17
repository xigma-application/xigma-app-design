// types
import { TPoint } from 'types/canvas';

export const normalizeVector = (vector: TPoint): TPoint => {
  const length = Math.hypot(vector.x, vector.y);

  return { x: vector.x / length, y: vector.y / length };
};
