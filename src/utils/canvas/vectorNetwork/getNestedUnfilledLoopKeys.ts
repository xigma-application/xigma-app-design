// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { computeClusters } from './getVectorNodeClusters/computeClusters';
import { deriveClusterFaces } from './deriveVectorFaces/deriveClusterFaces';
import { getPlanarVectorNetwork } from './getPlanarVectorNetwork';
import { getPointInsideFace } from './buildVectorNodeFromLoops/assembleVectorNodeFromLoopGeometries/getPointInsideFace';
import { getPolygonArea } from 'components/Design/Canvas/utils/getPolygonArea';
import { getVectorFillLoopKey } from './getVectorFillLoopKey';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

export const getNestedUnfilledLoopKeys = (node: TVectorNode, containingFacePoints: TPoint[]): string[] => {
  const filledKeySet = new Set(node.filledFaceKeys);
  const planar = getPlanarVectorNetwork(node);
  const clusters = computeClusters(planar.segments, planar.vertices);
  const containingArea = getPolygonArea(containingFacePoints);

  return clusters.flatMap((cluster) => {
    const faces = deriveClusterFaces(cluster, planar, node.vertices);
    const isClusterUntouched = faces.every((face) => !filledKeySet.has(getVectorFillLoopKey(face.pieceKeys)));

    if (!isClusterUntouched) {
      return [];
    }

    return faces
      .filter((face) => getPolygonArea(face.points) < containingArea)
      .filter((face) => isPointInPolygonVertices(getPointInsideFace(face.points), containingFacePoints))
      .map((face) => getVectorFillLoopKey(face.pieceKeys));
  });
};
