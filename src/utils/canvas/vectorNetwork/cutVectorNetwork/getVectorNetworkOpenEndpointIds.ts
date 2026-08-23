// types
import { TVectorSegment } from 'types/design/types';

export const getVectorNetworkOpenEndpointIds = (segments: Record<string, TVectorSegment>): string[] => {
  const degreeByVertexId = new Map<string, number>();

  Object.values(segments).forEach((segment) => {
    degreeByVertexId.set(segment.startId, (degreeByVertexId.get(segment.startId) ?? 0) + 1);
    degreeByVertexId.set(segment.endId, (degreeByVertexId.get(segment.endId) ?? 0) + 1);
  });

  return [...degreeByVertexId.entries()].filter(([, degree]) => degree === 1).map(([vertexId]) => vertexId);
};
