// types
import { TCachedFlattenedSegment, TNetworkCrossings } from './types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { computeFullNetworkCrossings } from './computeFullNetworkCrossings';
import { computeIncrementalNetworkCrossings } from './computeIncrementalNetworkCrossings';
import { detectMovedSegmentIds } from './detectMovedSegmentIds';
import { getCachedFlattenedSegment } from './getCachedFlattenedSegment';

type TLastKnownCrossingsState = {
  crossings: TNetworkCrossings;
  entryBySegmentId: Map<string, TCachedFlattenedSegment>;
  segmentIdsByVertexId: Map<string, [string, string]>;
};

const MAX_INCREMENTAL_MOVED_SEGMENTS = 8;
const lastKnownByNodeId = new Map<string, TLastKnownCrossingsState>();

export const findAllNetworkCrossings = (
  nodeId: string | null,
  segments: TVectorSegment[],
  vertices: Record<string, TVectorVertex>,
): TNetworkCrossings => {
  const cachedById = new Map(segments.map((segment) => [segment.id, getCachedFlattenedSegment(segment, vertices)]));

  if (nodeId === null) {
    return computeFullNetworkCrossings(segments, vertices, cachedById).crossings;
  }

  const lastKnown = lastKnownByNodeId.get(nodeId);
  const movedIds = lastKnown && detectMovedSegmentIds(segments, cachedById, lastKnown.entryBySegmentId, MAX_INCREMENTAL_MOVED_SEGMENTS);

  if (lastKnown && movedIds) {
    if (movedIds.length === 0) {
      return lastKnown.crossings;
    }

    const segmentsById = new Map(segments.map((segment) => [segment.id, segment]));
    const { crossings, segmentIdsByVertexId } = computeIncrementalNetworkCrossings(
      vertices,
      segmentsById,
      cachedById,
      movedIds,
      lastKnown.crossings,
      lastKnown.segmentIdsByVertexId,
    );

    lastKnownByNodeId.set(nodeId, { crossings, entryBySegmentId: cachedById, segmentIdsByVertexId });

    return crossings;
  }

  const { crossings, segmentIdsByVertexId } = computeFullNetworkCrossings(segments, vertices, cachedById);

  lastKnownByNodeId.set(nodeId, { crossings, entryBySegmentId: cachedById, segmentIdsByVertexId });

  return crossings;
};
