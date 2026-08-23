// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces, TVectorFace } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { getPolygonArea } from './getPolygonArea';
import { isPointInPolygonVertices } from './isPointInPolygonVertices';

export const getVectorFaceAtPoint = (point: TPoint, node: TVectorNode): TVectorFace | null =>
  deriveVectorFaces(node)
    .filter((face) => isPointInPolygonVertices(point, face.points))
    .reduce<TVectorFace | null>((smallest, face) => {
      if (!smallest || getPolygonArea(face.points) < getPolygonArea(smallest.points)) {
        return face;
      }

      return smallest;
    }, null);
