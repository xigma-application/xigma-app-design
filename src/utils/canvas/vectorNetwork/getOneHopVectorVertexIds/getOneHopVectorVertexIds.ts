// utils
import { getStraightAdjacency } from './getStraightAdjacency';

// types
import { TVectorNode } from 'types/design/types';

export const getOneHopVectorVertexIds = (node: TVectorNode, selectedVertexIds: string[]): string[] => {
  const adjacency = getStraightAdjacency(node);
  const expanded = new Set(selectedVertexIds);

  selectedVertexIds.forEach((id) => {
    (adjacency.get(id) ?? []).forEach((neighborId) => expanded.add(neighborId));
  });

  return Array.from(expanded);
};
