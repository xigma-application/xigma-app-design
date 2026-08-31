// types
import { TPoint } from 'types/canvas';
import { TVectorFace } from 'utils/canvas/vectorNetwork/deriveVectorFaces/types';

// utils
import { getPointInsideFace } from './getPointInsideFace';

const getEdgeWindingContribution = (point: TPoint, [from, to]: [TPoint, TPoint]): number => {
  const isLeftOfEdge = (to.x - from.x) * (point.y - from.y) - (point.x - from.x) * (to.y - from.y);
  const isUpwardCrossing = from.y <= point.y && to.y > point.y;
  const isDownwardCrossing = from.y > point.y && to.y <= point.y;

  switch (true) {
    case isUpwardCrossing && isLeftOfEdge > 0:
      return 1;
    case isDownwardCrossing && isLeftOfEdge < 0:
      return -1;
    default:
      return 0;
  }
};

const getWindingNumber = (point: TPoint, edges: [TPoint, TPoint][]): number =>
  edges.reduce((winding, edge) => winding + getEdgeWindingContribution(point, edge), 0);

export const isFaceInsideCluster = (face: TVectorFace, clusterEdges: [TPoint, TPoint][]): boolean =>
  getWindingNumber(getPointInsideFace(face.points), clusterEdges) !== 0;
