// types
import { TVectorSegment } from 'types/design/types';

export const buildVectorAdjacency = (segments: Record<string, TVectorSegment>): Map<string, string[]> => {
  const adjacency = new Map<string, string[]>();

  Object.values(segments).forEach((segment) => {
    adjacency.set(segment.startId, [...(adjacency.get(segment.startId) ?? []), segment.id]);
    adjacency.set(segment.endId, [...(adjacency.get(segment.endId) ?? []), segment.id]);
  });

  return adjacency;
};
