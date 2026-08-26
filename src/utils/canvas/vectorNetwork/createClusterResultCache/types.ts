// types
import { TPlanarVectorNetwork } from '../planarizeVectorNetwork/types';
import { TVectorNodeCluster } from '../getVectorNodeClusters/types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

export type TClusterResultCache<T> = {
  get: (nodeId: string, cluster: TVectorNodeCluster, extraKey: string, planar: TPlanarVectorNetwork, compute: () => T) => T;
};

export type TCacheEntry<T> = {
  result: T;
  segments: Map<string, TVectorSegment>;
  vertices: Map<string, TVectorVertex>;
};
