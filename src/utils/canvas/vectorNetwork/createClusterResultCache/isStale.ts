// types
import { TCacheEntry } from './types';
import { TPlanarVectorNetwork } from '../planarizeVectorNetwork/types';
import { TVectorNodeCluster } from '../getVectorNodeClusters/types';

export const isStale = (entry: TCacheEntry<unknown>, cluster: TVectorNodeCluster, planar: TPlanarVectorNetwork): boolean =>
  entry.vertices.size !== cluster.vertexIds.length ||
  entry.segments.size !== cluster.segmentIds.length ||
  cluster.vertexIds.some((id) => entry.vertices.get(id) !== planar.vertices[id]) ||
  cluster.segmentIds.some((id) => entry.segments.get(id) !== planar.segments[id]);
