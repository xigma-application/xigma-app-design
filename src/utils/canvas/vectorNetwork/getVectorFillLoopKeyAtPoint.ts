// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces, TVectorFace } from './deriveVectorFaces/deriveVectorFaces';
import { getPolygonArea } from 'components/Design/Canvas/utils/getPolygonArea';
import { getVectorFillLoopKey } from './getVectorFillLoopKey';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

export const getVectorFillLoopKeyAtPoint = (node: TVectorNode, point: TPoint): string | null => {
  const face = deriveVectorFaces(node)
    .filter((candidate) => isPointInPolygonVertices(point, candidate.points))
    .reduce<TVectorFace | null>((smallest, candidate) => {
      if (!smallest || getPolygonArea(candidate.points) < getPolygonArea(smallest.points)) {
        return candidate;
      }

      return smallest;
    }, null);

  if (!face) {
    return null;
  }

  const key = getVectorFillLoopKey(face.pieceKeys);

  return node.filledFaceKeys.includes(key) ? key : null;
};
