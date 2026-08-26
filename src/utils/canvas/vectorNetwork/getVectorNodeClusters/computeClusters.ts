// types
import { TPlanarVectorNetwork } from '../planarizeVectorNetwork/types';
import { TVectorNodeCluster } from './types';

// utils
import { buildVectorAdjacency } from '../cutVectorNetwork/buildVectorAdjacency';
import { findConnectedVertexIds } from '../cutVectorNetwork/findConnectedVertexIds';

export const computeClusters = (
  segments: TPlanarVectorNetwork['segments'],
  vertices: TPlanarVectorNetwork['vertices'],
): TVectorNodeCluster[] => {
  const adjacency = buildVectorAdjacency(segments);
  const visited = new Set<string>();
  const clusters: TVectorNodeCluster[] = [];

  Object.keys(vertices).forEach((vertexId) => {
    if (!visited.has(vertexId)) {
      const vertexIds = findConnectedVertexIds(vertexId, segments, adjacency);
      const segmentIds = new Set<string>();

      vertexIds.forEach((id) => {
        visited.add(id);
        (adjacency.get(id) ?? []).forEach((segmentId) => segmentIds.add(segmentId));
      });

      if (segmentIds.size > 0) {
        const vertexIdList = [...vertexIds];
        clusters.push({ key: [...vertexIdList].sort().join(','), segmentIds: [...segmentIds], vertexIds: vertexIdList });
      }
    }
  });

  return clusters;
};
