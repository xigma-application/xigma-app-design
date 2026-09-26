// others
import { VECTOR_CORNER_MIN_ANGLE } from './constants';

// types
import { TPoint } from 'types/canvas';
import { TVectorCornerArc } from './types';

// utils
import { normalizeVector } from 'utils/math/normalizeVector';

export const getVectorCornerArc = (corner: TPoint, firstEnd: TPoint, secondEnd: TPoint, radius: number): TVectorCornerArc | null => {
  const firstLength = Math.hypot(firstEnd.x - corner.x, firstEnd.y - corner.y);
  const secondLength = Math.hypot(secondEnd.x - corner.x, secondEnd.y - corner.y);
  const first = normalizeVector({ x: firstEnd.x - corner.x, y: firstEnd.y - corner.y });
  const second = normalizeVector({ x: secondEnd.x - corner.x, y: secondEnd.y - corner.y });
  const angle = Math.acos(Math.min(Math.max(first.x * second.x + first.y * second.y, -1), 1));

  if (angle > VECTOR_CORNER_MIN_ANGLE && angle < Math.PI - VECTOR_CORNER_MIN_ANGLE) {
    const halfTan = Math.tan(angle / 2);
    const distance = Math.min(radius / halfTan, firstLength / 2, secondLength / 2);
    const handle = (4 / 3) * Math.tan((Math.PI - angle) / 4) * distance * halfTan;

    return {
      end: { x: corner.x + second.x * distance, y: corner.y + second.y * distance },
      start: { x: corner.x + first.x * distance, y: corner.y + first.y * distance },
      tangentEnd: { x: -second.x * handle, y: -second.y * handle },
      tangentStart: { x: -first.x * handle, y: -first.y * handle },
    };
  }

  return null;
};
