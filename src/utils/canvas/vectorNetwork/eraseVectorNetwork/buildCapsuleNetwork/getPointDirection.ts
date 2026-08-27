// types
import { TPoint } from 'types/canvas';

// utils
import { normalizeVector } from 'utils/math/normalizeVector';

export const getPointDirection = (path: TPoint[], index: number): TPoint => {
  const incoming = index > 0 ? normalizeVector({ x: path[index].x - path[index - 1].x, y: path[index].y - path[index - 1].y }) : null;
  const outgoing =
    index < path.length - 1 ? normalizeVector({ x: path[index + 1].x - path[index].x, y: path[index + 1].y - path[index].y }) : null;

  switch (true) {
    case !incoming:
      return outgoing!;
    case !outgoing:
      return incoming;
    default: {
      const averaged = normalizeVector({ x: incoming.x + outgoing.x, y: incoming.y + outgoing.y });

      return Math.hypot(averaged.x, averaged.y) === 0 ? incoming : averaged;
    }
  }
};
