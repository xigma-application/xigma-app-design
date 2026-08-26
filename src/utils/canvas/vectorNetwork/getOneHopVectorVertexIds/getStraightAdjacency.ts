// utils
import { isStraightSegment } from './isStraightSegment';

// types
import { TVectorNode } from 'types/design/types';

const adjacencyCache = new WeakMap<TVectorNode, Map<string, string[]>>();

export const getStraightAdjacency = (node: TVectorNode): Map<string, string[]> => {
  const cached = adjacencyCache.get(node);

  if (!cached) {
    const adjacency = new Map<string, string[]>();

    Object.values(node.segments).forEach((segment) => {
      if (isStraightSegment(segment)) {
        adjacency.set(segment.startId, [...(adjacency.get(segment.startId) ?? []), segment.endId]);
        adjacency.set(segment.endId, [...(adjacency.get(segment.endId) ?? []), segment.startId]);
      }
    });
    adjacencyCache.set(node, adjacency);

    return adjacency;
  }

  return cached;
};
