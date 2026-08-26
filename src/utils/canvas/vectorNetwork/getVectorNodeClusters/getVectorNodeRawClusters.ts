// types
import { TVectorNode } from 'types/design/types';
import { TVectorNodeCluster } from './types';

// utils
import { computeClusters } from './computeClusters';

const rawCache = new WeakMap<TVectorNode, TVectorNodeCluster[]>();

export const getVectorNodeRawClusters = (node: TVectorNode): TVectorNodeCluster[] => {
  const cached = rawCache.get(node);

  if (!cached) {
    const clusters = computeClusters(node.segments, node.vertices);
    rawCache.set(node, clusters);

    return clusters;
  }

  return cached;
};
