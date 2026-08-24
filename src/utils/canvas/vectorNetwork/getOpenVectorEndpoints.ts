// types
import { TVectorNode } from 'types/design/types';

export const getOpenVectorEndpoints = (node: TVectorNode): string[] => {
  const segmentCounts: Record<string, number> = {};

  Object.values(node.segments).forEach((segment) => {
    segmentCounts[segment.startId] = (segmentCounts[segment.startId] ?? 0) + 1;
    segmentCounts[segment.endId] = (segmentCounts[segment.endId] ?? 0) + 1;
  });

  return Object.keys(node.vertices).filter((vertexId) => segmentCounts[vertexId] === 1);
};
