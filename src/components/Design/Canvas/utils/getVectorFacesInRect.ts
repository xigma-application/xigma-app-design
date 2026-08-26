// types
import { TDraftRect } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces, TVectorFace } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { isPointInPolygonVertices } from './isPointInPolygonVertices';
import { isPointInRect } from './isPointInRect';

export const getVectorFacesInRect = (node: TVectorNode, rect: TDraftRect): TVectorFace[] => {
  const corners = getRectCorners(rect);

  return deriveVectorFaces(node).filter(
    (face) =>
      face.points.some((point) => isPointInRect(point, rect)) || corners.some((corner) => isPointInPolygonVertices(corner, face.points)),
  );
};
