// types
import { TPoint } from 'types/canvas';
import { TVectorFace } from 'utils/canvas/vectorNetwork/deriveVectorFaces/types';

// utils
import { getPointInsideFace } from './getPointInsideFace';

const getWindingNumber = (point: TPoint, edges: [TPoint, TPoint][]): number =>
  edges.reduce((winding, [from, to]) => {
    const isLeftOfEdge = (to.x - from.x) * (point.y - from.y) - (point.x - from.x) * (to.y - from.y);

    if (from.y <= point.y && to.y > point.y && isLeftOfEdge > 0) {
      return winding + 1;
    }

    if (from.y > point.y && to.y <= point.y && isLeftOfEdge < 0) {
      return winding - 1;
    }

    return winding;
  }, 0);

export const isFaceInsideCluster = (face: TVectorFace, clusterEdges: [TPoint, TPoint][]): boolean =>
  getWindingNumber(getPointInsideFace(face.points), clusterEdges) !== 0;
