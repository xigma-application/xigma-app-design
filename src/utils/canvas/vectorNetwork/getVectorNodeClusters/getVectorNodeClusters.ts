// types
import { TPlanarVectorNetwork } from '../planarizeVectorNetwork/types';
import { TVectorNodeCluster } from './types';

// utils
import { computeClusters } from './computeClusters';

const planarCache = new WeakMap<TPlanarVectorNetwork, TVectorNodeCluster[]>();

export const getVectorNodeClusters = (planar: TPlanarVectorNetwork): TVectorNodeCluster[] => {
  const cached = planarCache.get(planar);

  if (!cached) {
    const clusters = computeClusters(planar.segments, planar.vertices);
    planarCache.set(planar, clusters);

    return clusters;
  }

  return cached;
};
