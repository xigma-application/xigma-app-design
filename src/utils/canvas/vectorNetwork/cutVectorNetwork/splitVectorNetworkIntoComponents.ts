// types
import { TVectorNetworkComponent } from './types';

// utils
import { buildVectorAdjacency } from './buildVectorAdjacency';
import { findConnectedVertexIds } from './findConnectedVertexIds';

export const splitVectorNetworkIntoComponents = (network: TVectorNetworkComponent): TVectorNetworkComponent[] => {
  const adjacency = buildVectorAdjacency(network.segments);
  const visitedVertexIds = new Set<string>();
  const components: TVectorNetworkComponent[] = [];

  Object.keys(network.vertices).forEach((vertexId) => {
    const isUnvisited = !visitedVertexIds.has(vertexId);

    if (isUnvisited) {
      const componentVertexIds = findConnectedVertexIds(vertexId, network.segments, adjacency);
      const segmentIds = new Set<string>();

      componentVertexIds.forEach((id) => {
        visitedVertexIds.add(id);
        (adjacency.get(id) ?? []).forEach((segmentId) => segmentIds.add(segmentId));
      });

      if (segmentIds.size > 0) {
        const vertices = Object.fromEntries([...componentVertexIds].map((id) => [id, network.vertices[id]]));
        const segments = Object.fromEntries([...segmentIds].map((id) => [id, network.segments[id]]));
        const vertexHandleModes = Object.fromEntries(
          [...componentVertexIds].filter((id) => id in network.vertexHandleModes).map((id) => [id, network.vertexHandleModes[id]]),
        );

        components.push({ segments, vertexHandleModes, vertices });
      }
    }
  });

  return components;
};
