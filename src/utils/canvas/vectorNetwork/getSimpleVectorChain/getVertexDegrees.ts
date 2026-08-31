// utils
import { TFlattenedVectorSegment } from '../flattenVectorSegments';

export const getVertexDegrees = (segments: TFlattenedVectorSegment[]): Map<string, number> => {
  const degrees = new Map<string, number>();

  segments.forEach((segment) => {
    degrees.set(segment.startId, (degrees.get(segment.startId) ?? 0) + 1);
    degrees.set(segment.endId, (degrees.get(segment.endId) ?? 0) + 1);
  });

  return degrees;
};
