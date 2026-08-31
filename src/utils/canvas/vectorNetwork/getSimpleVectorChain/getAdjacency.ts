// utils
import { TFlattenedVectorSegment } from '../flattenVectorSegments';

export const getAdjacency = (segments: TFlattenedVectorSegment[]): Map<string, TFlattenedVectorSegment[]> => {
  const adjacency = new Map<string, TFlattenedVectorSegment[]>();

  segments.forEach((segment) => {
    adjacency.set(segment.startId, [...(adjacency.get(segment.startId) ?? []), segment]);
    adjacency.set(segment.endId, [...(adjacency.get(segment.endId) ?? []), segment]);
  });

  return adjacency;
};
