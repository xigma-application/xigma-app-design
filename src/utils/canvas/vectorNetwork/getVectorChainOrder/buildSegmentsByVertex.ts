// types
import { TVectorSegment } from 'types/design/types';

export const buildSegmentsByVertex = (segments: TVectorSegment[]): Map<string, TVectorSegment[]> => {
  const segmentsByVertex = new Map<string, TVectorSegment[]>();

  segments.forEach((segment) => {
    [segment.startId, segment.endId].forEach((vertexId) => {
      segmentsByVertex.set(vertexId, [...(segmentsByVertex.get(vertexId) ?? []), segment]);
    });
  });

  return segmentsByVertex;
};
