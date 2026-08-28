// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getQuadVertices } from '../getQuadVertices';

export const getVectorFillCoveringQuad = (faces: TPoint[][], nodeBounds: TDraftRect | null = null): number[] => {
  if (!nodeBounds) {
    const points = faces.flat();
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    return getQuadVertices(minX, minY, maxX, minY, maxX, maxY, minX, maxY);
  }

  const { height, width, x, y } = nodeBounds;
  return getQuadVertices(x, y, x + width, y, x + width, y + height, x, y + height);
};
