// types
import { TCachedFlattenedSegment, TNetworkCrossings } from './types';
import { TSegmentCrossing } from '../types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { addCrossingsForPair } from './addCrossingsForPair';
import { findOverlappingSegmentPairs } from './findOverlappingSegmentPairs';

export const computeFullNetworkCrossings = (
  segments: TVectorSegment[],
  vertices: Record<string, TVectorVertex>,
  cachedById: Map<string, TCachedFlattenedSegment>,
): { crossings: TNetworkCrossings; segmentIdsByVertexId: Map<string, [string, string]> } => {
  const boundingBoxes = segments.map((segment, index) => ({ ...cachedById.get(segment.id)!.bbox, index }));
  const crossingsBySegmentId = new Map<string, TSegmentCrossing[]>();
  const virtualVertices: Record<string, TVectorVertex> = {};
  const segmentIdsByVertexId = new Map<string, [string, string]>();

  findOverlappingSegmentPairs(boundingBoxes).forEach(([i, j]) => {
    const a = segments[i];
    const b = segments[j];
    const pointsA = cachedById.get(a.id)!.points;
    const pointsB = cachedById.get(b.id)!.points;

    addCrossingsForPair(a, b, pointsA, pointsB, vertices, crossingsBySegmentId, virtualVertices, segmentIdsByVertexId);
  });

  return { crossings: { crossingsBySegmentId, virtualVertices }, segmentIdsByVertexId };
};
