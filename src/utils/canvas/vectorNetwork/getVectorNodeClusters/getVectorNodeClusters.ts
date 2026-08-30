// types
import { TPlanarVectorNetwork } from '../planarizeVectorNetwork/types';
import { TVectorNodeCluster } from './types';

// utils
import { computeClusters } from './computeClusters';
import { isRawSegmentTopologyUnchanged } from './isRawSegmentTopologyUnchanged';

type TLastKnownPlanarClusters = { clusters: TVectorNodeCluster[]; segments: TPlanarVectorNetwork['segments'] };

const planarCache = new WeakMap<TPlanarVectorNetwork, TVectorNodeCluster[]>();
const lastKnownByNodeId = new Map<string, TLastKnownPlanarClusters>();

export const getVectorNodeClusters = (nodeId: string, planar: TPlanarVectorNetwork): TVectorNodeCluster[] => {
  const cached = planarCache.get(planar);

  if (cached) {
    return cached;
  }

  const lastKnown = lastKnownByNodeId.get(nodeId);
  const clusters =
    lastKnown && isRawSegmentTopologyUnchanged(lastKnown.segments, planar.segments)
      ? lastKnown.clusters
      : computeClusters(planar.segments, planar.vertices);

  planarCache.set(planar, clusters);
  lastKnownByNodeId.set(nodeId, { clusters, segments: planar.segments });

  return clusters;
};
