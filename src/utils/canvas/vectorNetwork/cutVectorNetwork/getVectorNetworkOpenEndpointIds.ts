// types
import { TVectorSegment } from 'types/design/types';

// utils
import { getVectorVertexDegrees } from '../getVectorVertexDegrees';

export const getVectorNetworkOpenEndpointIds = (segments: Record<string, TVectorSegment>): string[] => {
  const degreeByVertexId = getVectorVertexDegrees(segments);
  return [...degreeByVertexId.entries()].filter(([, degree]) => degree === 1).map(([vertexId]) => vertexId);
};
