// types
import { TLineNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const rotateLineNodeOrigin = (
  origin: { x1: number; x2: number; y1: number; y2: number },
  pivot: TPoint,
  deltaDegrees: number,
): Partial<TLineNode> => {
  const { x: x1, y: y1 } = rotatePoint({ x: origin.x1, y: origin.y1 }, pivot, deltaDegrees);
  const { x: x2, y: y2 } = rotatePoint({ x: origin.x2, y: origin.y2 }, pivot, deltaDegrees);

  return { x1: Math.round(x1), x2: Math.round(x2), y1: Math.round(y1), y2: Math.round(y2) };
};
