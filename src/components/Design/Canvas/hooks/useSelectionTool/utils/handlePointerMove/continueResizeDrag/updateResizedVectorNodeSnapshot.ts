// types
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

export const updateResizedVectorNodeSnapshot = (
  snapshot: TVectorNodeResizeSnapshot,
  anchors: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
): void => {
  snapshot.anchorX = anchors.x;
  snapshot.anchorY = anchors.y;
  snapshot.scaleX = scaleX;
  snapshot.scaleY = scaleY;
};
