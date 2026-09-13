// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getQuadVertices } from '../getQuadVertices';
import { getVectorFillBounds } from './getVectorFillBounds';

export const getVectorFillCoveringQuad = (faces: TPoint[][], nodeBounds: TDraftRect | null = null): number[] => {
  const { height, width, x, y } = getVectorFillBounds(faces, nodeBounds);
  return getQuadVertices(x, y, x + width, y, x + width, y + height, x, y + height);
};
