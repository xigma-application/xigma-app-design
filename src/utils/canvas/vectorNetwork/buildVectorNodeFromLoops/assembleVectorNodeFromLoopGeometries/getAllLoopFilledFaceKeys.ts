// types
import { TVectorNode } from 'types/design/types';

// utils
import { computeClusters } from 'utils/canvas/vectorNetwork/getVectorNodeClusters/computeClusters';
import { deriveClusterFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveClusterFaces';
import { getClusterFlattenedEdges } from './getClusterFlattenedEdges';
import { getPlanarVectorNetwork } from 'utils/canvas/vectorNetwork/getPlanarVectorNetwork';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';
import { isFaceInsideCluster } from './isFaceInsideCluster';

export const getAllLoopFilledFaceKeys = (node: TVectorNode): string[] => {
  const planar = getPlanarVectorNetwork(node);
  const clusters = computeClusters(planar.segments, planar.vertices);

  return clusters.flatMap((cluster) => {
    const faces = deriveClusterFaces(cluster, planar, node.vertices);
    const clusterEdges = getClusterFlattenedEdges(cluster, planar);

    return faces.filter((face) => isFaceInsideCluster(face, clusterEdges)).map((face) => getVectorFillLoopKey(face.pieceKeys));
  });
};
