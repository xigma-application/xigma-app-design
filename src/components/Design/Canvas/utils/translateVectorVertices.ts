// types
import { TPoint } from 'types/canvas';
import { TVectorVertex } from 'types/design/types';

export const translateVectorVertices = (origins: Record<string, TPoint>, deltaX: number, deltaY: number): Record<string, TVectorVertex> =>
  Object.fromEntries(
    Object.entries(origins).map(([id, origin]) => [id, { id, x: Math.round(origin.x + deltaX), y: Math.round(origin.y + deltaY) }]),
  );
