// types
import { TPoint } from 'types/canvas';

// utils
import { segmentsIntersect } from './segmentsIntersect';

export const boundariesCross = (a: TPoint[], b: TPoint[]): boolean =>
  a.some((p, i) => {
    const next = a[(i + 1) % a.length];
    return b.some((q, j) => segmentsIntersect(p, next, q, b[(j + 1) % b.length]));
  });
