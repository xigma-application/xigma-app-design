// types
import { TPoint } from 'types/canvas';
import { TVectorVertex } from 'types/design/types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const rotateVectorVertices = (origins: Record<string, TPoint>, pivot: TPoint, deltaDegrees: number): Record<string, TVectorVertex> =>
  Object.fromEntries(
    Object.entries(origins).map(([id, origin]) => {
      const rotated = rotatePoint(origin, pivot, deltaDegrees);

      return [id, { id, x: Math.round(rotated.x), y: Math.round(rotated.y) }];
    }),
  );
