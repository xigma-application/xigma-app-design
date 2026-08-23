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

      componentVertexIds.forEach((id) => visitedVertexIds.add(id));

      const vertices = Object.fromEntries(Object.entries(network.vertices).filter(([id]) => componentVertexIds.has(id)));
      const segments = Object.fromEntries(
        Object.entries(network.segments).filter(([, segment]) => componentVertexIds.has(segment.startId)),
      );
      const vertexHandleModes = Object.fromEntries(Object.entries(network.vertexHandleModes).filter(([id]) => id in vertices));

      if (Object.keys(segments).length > 0) {
        components.push({ segments, vertexHandleModes, vertices });
      }
    }
  });

  return components;
};
