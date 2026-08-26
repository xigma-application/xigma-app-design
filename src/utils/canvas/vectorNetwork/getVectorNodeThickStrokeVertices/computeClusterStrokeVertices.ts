// types
import { TFlattenedVectorSegment } from '../flattenVectorSegments';
import { TPlanarVectorNetwork } from '../planarizeVectorNetwork/types';
import { TVectorNode } from 'types/design/types';
import { TVectorNodeCluster } from '../getVectorNodeClusters/types';

// utils
import { collectVectorPathVertexEndpoints } from '../getThickVectorPathVertices/collectVectorPathVertexEndpoints';
import { createClusterResultCache } from '../createClusterResultCache/createClusterResultCache';
import { flattenClusterSegments } from './flattenClusterSegments';
import { getThickPolylineVertices } from '../getThickPolylineVertices';
import { getVectorPathJoinVertices } from '../getThickVectorPathVertices/getVectorPathJoinVertices';

const flattenCache = createClusterResultCache<TFlattenedVectorSegment[]>(20000);

export const computeClusterStrokeVertices = (
  cluster: TVectorNodeCluster,
  node: TVectorNode,
  halfWidth: number,
  rawNetwork: TPlanarVectorNetwork,
): number[] => {
  const flattened = flattenCache.get(node.id, cluster, '', rawNetwork, () => flattenClusterSegments(cluster, node.segments, node.vertices));
  const segmentVertices = flattened.flatMap(({ points }) => getThickPolylineVertices(points, halfWidth));
  const endpointsByVertexId = collectVectorPathVertexEndpoints(flattened, halfWidth);
  const joinVertices = getVectorPathJoinVertices(endpointsByVertexId, halfWidth);

  return [...segmentVertices, ...joinVertices];
};
