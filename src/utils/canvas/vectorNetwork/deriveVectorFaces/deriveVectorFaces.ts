// types
import { TVectorNode } from 'types/design/types';
import { TVectorFace } from './types';

// utils
import { createClusterResultCache } from '../createClusterResultCache/createClusterResultCache';
import { deriveClusterFaces } from './deriveClusterFaces';
import { getPlanarVectorNetwork } from '../getPlanarVectorNetwork';
import { getVectorNodeClusters } from '../getVectorNodeClusters/getVectorNodeClusters';

const cache = createClusterResultCache<TVectorFace[]>(20000);
const wholeNodeCache = new WeakMap<TVectorNode, TVectorFace[]>();

export const deriveVectorFaces = (node: TVectorNode): TVectorFace[] => {
  const cachedForNode = wholeNodeCache.get(node);

  if (!cachedForNode) {
    const planar = getPlanarVectorNetwork(node);
    const clusters = getVectorNodeClusters(node.id, planar);
    const faces = clusters.flatMap((cluster) =>
      cache.get(node.id, cluster, '', planar, () => deriveClusterFaces(cluster, planar, node.vertices)),
    );

    wholeNodeCache.set(node, faces);
    return faces;
  }

  return cachedForNode;
};

export type { TVectorFace } from './types';
