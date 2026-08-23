// types
import { TVectorSegment } from 'types/design/types';

export const findConnectedVertexIds = (
  seedVertexId: string,
  segments: Record<string, TVectorSegment>,
  adjacency: Map<string, string[]>,
): Set<string> => {
  const visited = new Set<string>([seedVertexId]);
  const queue: string[] = [seedVertexId];

  while (queue.length > 0) {
    const vertexId = queue.shift() as string;
    const segmentIds = adjacency.get(vertexId) ?? [];

    segmentIds.forEach((segmentId) => {
      const segment = segments[segmentId];
      const otherVertexId = segment.startId === vertexId ? segment.endId : segment.startId;

      if (!visited.has(otherVertexId)) {
        visited.add(otherVertexId);
        queue.push(otherVertexId);
      }
    });
  }

  return visited;
};
