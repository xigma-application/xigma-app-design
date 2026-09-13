// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getVectorFillBounds = (faces: TPoint[][], nodeBounds: TDraftRect | null = null): TDraftRect => {
  if (!nodeBounds) {
    const points = faces.flat();
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    return { height: maxY - minY, width: maxX - minX, x: minX, y: minY };
  }

  return nodeBounds;
};
