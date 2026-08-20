// types
import { TVectorNode } from 'types/design/types';

export const getVectorSegmentVertexIds = (node: TVectorNode, segmentIds: string[]): string[] => {
  const vertexIds = new Set<string>();

  segmentIds.forEach((segmentId) => {
    const segment = node.segments[segmentId];

    if (segment) {
      vertexIds.add(segment.startId);
      vertexIds.add(segment.endId);
    }
  });

  return Array.from(vertexIds);
};
