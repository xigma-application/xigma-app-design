// types
import { TPoint } from 'types/canvas';

// utils
import { getQuadVertices } from '../getQuadVertices';

export const getVectorFillCoveringQuad = (faces: TPoint[][]): number[] => {
  const points = faces.flat();
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return getQuadVertices(minX, minY, maxX, minY, maxX, maxY, minX, maxY);
};
