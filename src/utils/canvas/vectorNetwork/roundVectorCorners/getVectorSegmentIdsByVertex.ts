// types
import { TVectorSegment } from 'types/design/types';

export const getVectorSegmentIdsByVertex = (segments: Record<string, TVectorSegment>): Map<string, string[]> => {
  const idsByVertex = new Map<string, string[]>();

  Object.values(segments).forEach((segment) => {
    new Set([segment.startId, segment.endId]).forEach((vertexId) =>
      idsByVertex.set(vertexId, [...(idsByVertex.get(vertexId) ?? []), segment.id]),
    );
  });

  return idsByVertex;
};
