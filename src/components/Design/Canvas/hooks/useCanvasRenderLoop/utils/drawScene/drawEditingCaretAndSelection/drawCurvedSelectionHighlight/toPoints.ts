// types
import { TPoint } from 'types/canvas';

export const toPoints = (flat: number[]): TPoint[] =>
  Array.from({ length: flat.length / 2 }, (_, index) => ({ x: flat[index * 2], y: flat[index * 2 + 1] }));
