// types
import { TPoint } from 'types/canvas';
import { TVectorVertex } from 'types/design/types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const scaleVectorVertices = (
  origins: Record<string, TPoint>,
  pivot: TPoint,
  rotation: number,
  anchor: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
): Record<string, TVectorVertex> =>
  Object.fromEntries(
    Object.entries(origins).map(([id, origin]) => {
      const local = rotatePoint(origin, pivot, -rotation);
      const scaledLocal = {
        x: anchor.x === null ? local.x : anchor.x + (local.x - anchor.x) * scaleX,
        y: anchor.y === null ? local.y : anchor.y + (local.y - anchor.y) * scaleY,
      };
      const world = rotatePoint(scaledLocal, pivot, rotation);

      return [id, { id, x: Math.round(world.x), y: Math.round(world.y) }];
    }),
  );
