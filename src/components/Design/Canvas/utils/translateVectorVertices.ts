// types
import { TPoint } from 'types/canvas';
import { TVectorVertex } from 'types/design/types';

export const translateVectorVertices = (origins: Record<string, TPoint>, deltaX: number, deltaY: number): Record<string, TVectorVertex> => {
  const roundedDeltaX = Math.round(deltaX);
  const roundedDeltaY = Math.round(deltaY);

  return Object.fromEntries(
    Object.entries(origins).map(([id, origin]) => [id, { id, x: origin.x + roundedDeltaX, y: origin.y + roundedDeltaY }]),
  );
};
