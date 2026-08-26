// types
import { TVectorNodeCluster } from './getVectorNodeClusters/types';

const cache = new WeakMap<TVectorNodeCluster[], Map<string, TVectorNodeCluster>>();

export const getVectorClusterByRealSegmentId = (clusters: TVectorNodeCluster[]): Map<string, TVectorNodeCluster> => {
  const cached = cache.get(clusters);

  if (!cached) {
    const map = new Map<string, TVectorNodeCluster>();

    clusters.forEach((cluster) => {
      cluster.segmentIds.forEach((pieceId) => {
        map.set(pieceId.split('#')[0], cluster);
      });
    });
    cache.set(clusters, map);

    return map;
  }

  return cached;
};
