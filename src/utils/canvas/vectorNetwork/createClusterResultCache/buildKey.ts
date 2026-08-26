// types
import { TVectorNodeCluster } from '../getVectorNodeClusters/types';

export const buildKey = (nodeId: string, cluster: TVectorNodeCluster, extraKey: string): string =>
  `${nodeId}:${cluster.key}${extraKey ? `:${extraKey}` : ''}`;
