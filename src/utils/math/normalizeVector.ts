// types
import { TPoint } from 'types/canvas';

export const normalizeVector = (vector: TPoint): TPoint => {
  const length = Math.hypot(vector.x, vector.y);

  return length > 0 ? { x: vector.x / length, y: vector.y / length } : { x: 0, y: 0 };
};
