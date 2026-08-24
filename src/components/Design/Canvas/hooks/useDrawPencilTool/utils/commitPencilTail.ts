// types
import { TPoint } from 'types/canvas';

// utils
import { simplifyPencilPoints } from './simplifyPencilPoints';

export const commitPencilTail = (tail: TPoint[], committed: TPoint[], tolerance: number): TPoint[] => {
  const simplifiedTail = simplifyPencilPoints(tail, tolerance);
  return [...committed, ...simplifiedTail.slice(1)];
};
