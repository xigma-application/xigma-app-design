// types
import { TVectorSegment } from 'types/design/types';

export const getVectorVertexDegrees = (segments: Record<string, TVectorSegment>): Map<string, number> => {
  const degreeByVertexId = new Map<string, number>();

  Object.values(segments).forEach((segment) => {
    degreeByVertexId.set(segment.startId, (degreeByVertexId.get(segment.startId) ?? 0) + 1);
    degreeByVertexId.set(segment.endId, (degreeByVertexId.get(segment.endId) ?? 0) + 1);
  });

  return degreeByVertexId;
};
