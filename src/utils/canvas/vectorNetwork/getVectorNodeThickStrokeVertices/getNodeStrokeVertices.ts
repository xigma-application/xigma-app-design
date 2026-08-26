// types
import { TPlanarVectorNetwork } from '../planarizeVectorNetwork/types';
import { TVectorNode } from 'types/design/types';
import { TVectorNodeCluster } from '../getVectorNodeClusters/types';

// utils
import { computeClusterStrokeVertices } from './computeClusterStrokeVertices';
import { createClusterResultCache } from '../createClusterResultCache/createClusterResultCache';

const strokeCache = createClusterResultCache<number[]>(40000);

export const getNodeStrokeVertices = (
  node: TVectorNode,
  halfWidth: number,
  clusters: TVectorNodeCluster[],
  rawNetwork: TPlanarVectorNetwork,
): number[] =>
  clusters.flatMap((cluster) =>
    strokeCache.get(node.id, cluster, String(halfWidth), rawNetwork, () =>
      computeClusterStrokeVertices(cluster, node, halfWidth, rawNetwork),
    ),
  );
