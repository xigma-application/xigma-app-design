// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { computeClusters } from 'utils/canvas/vectorNetwork/getVectorNodeClusters/computeClusters';
import { deriveClusterFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveClusterFaces';
import { getPlanarVectorNetwork } from 'utils/canvas/vectorNetwork/getPlanarVectorNetwork';
import { getPointInsideFace } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/assembleVectorNodeFromLoopGeometries/getPointInsideFace';
import { getPolygonArea } from 'components/Design/Canvas/utils/getPolygonArea';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

export const getUntouchedClusterFaces = (node: TVectorNode): TPoint[][] => {
  const filledKeySet = new Set(node.filledFaceKeys);
  const planar = getPlanarVectorNetwork(node);
  const clusters = computeClusters(planar.segments, planar.vertices);

  return clusters.flatMap((cluster) => {
    const faces = deriveClusterFaces(cluster, planar, node.vertices);
    const isClusterUntouched = faces.every((face) => !filledKeySet.has(getVectorFillLoopKey(face.pieceKeys)));

    return isClusterUntouched ? faces.map((face) => face.points) : [];
  });
};

export const getNestedUnfilledCutoutFaces = (filledFacePoints: TPoint[], untouchedClusterFaces: TPoint[][]): TPoint[][] => {
  const filledArea = getPolygonArea(filledFacePoints);

  return untouchedClusterFaces
    .filter((facePoints) => getPolygonArea(facePoints) < filledArea)
    .filter((facePoints) => isPointInPolygonVertices(getPointInsideFace(facePoints), filledFacePoints));
};
