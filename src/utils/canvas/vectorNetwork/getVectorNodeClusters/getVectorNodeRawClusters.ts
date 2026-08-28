// types
import { TVectorNode } from 'types/design/types';
import { TVectorNodeCluster } from './types';

// utils
import { computeClusters } from './computeClusters';
import { isRawSegmentTopologyUnchanged } from './isRawSegmentTopologyUnchanged';

type TLastKnownRawClusters = { clusters: TVectorNodeCluster[]; segments: TVectorNode['segments'] };

const rawCache = new WeakMap<TVectorNode, TVectorNodeCluster[]>();
const lastKnownByNodeId = new Map<string, TLastKnownRawClusters>();

export const getVectorNodeRawClusters = (node: TVectorNode): TVectorNodeCluster[] => {
  const cached = rawCache.get(node);

  if (cached) {
    return cached;
  }

  const lastKnown = lastKnownByNodeId.get(node.id);
  const clusters =
    lastKnown && isRawSegmentTopologyUnchanged(lastKnown.segments, node.segments)
      ? lastKnown.clusters
      : computeClusters(node.segments, node.vertices);

  rawCache.set(node, clusters);
  lastKnownByNodeId.set(node.id, { clusters, segments: node.segments });

  return clusters;
};
