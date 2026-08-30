// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { computeLoopPoints } from './computeLoopPoints';
import { createClusterResultCache } from '../createClusterResultCache/createClusterResultCache';
import { getPlanarVectorNetwork } from '../getPlanarVectorNetwork';
import { getRealSegmentIdFromLoopKey } from './getRealSegmentIdFromLoopKey';
import { getVectorClusterByRealSegmentId } from '../getVectorClusterByRealSegmentId';
import { getVectorNodeClusters } from '../getVectorNodeClusters/getVectorNodeClusters';

const cache = createClusterResultCache<TPoint[] | null>(20000);
const wholeNodeCache = new WeakMap<TVectorNode, Map<string, TPoint[] | null>>();

export const getVectorFillLoopPoints = (node: TVectorNode, loopKey: string): TPoint[] | null => {
  const nodeCache = wholeNodeCache.get(node) ?? new Map<string, TPoint[] | null>();
  wholeNodeCache.set(node, nodeCache);

  if (!nodeCache.has(loopKey)) {
    const planar = getPlanarVectorNetwork(node);
    const cluster = getVectorClusterByRealSegmentId(getVectorNodeClusters(node.id, planar)).get(getRealSegmentIdFromLoopKey(loopKey));
    const result = cluster
      ? cache.get(node.id, cluster, loopKey, planar, () => computeLoopPoints(loopKey, planar, node.vertices))
      : computeLoopPoints(loopKey, planar, node.vertices);

    nodeCache.set(loopKey, result);

    return result;
  }

  return nodeCache.get(loopKey) ?? null;
};
