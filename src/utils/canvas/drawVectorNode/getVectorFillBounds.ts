// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getVectorFillBounds = (faces: TPoint[][], nodeBounds: TDraftRect | null = null): TDraftRect => {
  if (!nodeBounds) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    faces.forEach((face) => {
      face.forEach((point) => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    return { height: maxY - minY, width: maxX - minX, x: minX, y: minY };
  }

  return nodeBounds;
};
