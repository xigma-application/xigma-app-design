// types
import { TCachedFlattenedSegment, TNetworkCrossings } from './types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { addCrossingsForPair } from './addCrossingsForPair';
import { boundingBoxesOverlap } from './boundingBoxesOverlap';

export const computeIncrementalNetworkCrossings = (
  vertices: Record<string, TVectorVertex>,
  segmentsById: Map<string, TVectorSegment>,
  cachedById: Map<string, TCachedFlattenedSegment>,
  movedIds: string[],
  lastCrossings: TNetworkCrossings,
  lastSegmentIdsByVertexId: Map<string, [string, string]>,
): { crossings: TNetworkCrossings; segmentIdsByVertexId: Map<string, [string, string]> } => {
  const crossingsBySegmentId = new Map(lastCrossings.crossingsBySegmentId);
  const virtualVertices = { ...lastCrossings.virtualVertices };
  const segmentIdsByVertexId = new Map(lastSegmentIdsByVertexId);

  movedIds.forEach((movedId) => {
    (crossingsBySegmentId.get(movedId) ?? []).forEach(({ vertexId }) => {
      const [firstId, secondId] = segmentIdsByVertexId.get(vertexId)!;
      const partnerId = firstId === movedId ? secondId : firstId;
      const partnerList = crossingsBySegmentId.get(partnerId)!.filter((entry) => entry.vertexId !== vertexId);

      if (partnerList.length > 0) {
        crossingsBySegmentId.set(partnerId, partnerList);
      } else {
        crossingsBySegmentId.delete(partnerId);
      }

      delete virtualVertices[vertexId];
      segmentIdsByVertexId.delete(vertexId);
    });

    crossingsBySegmentId.delete(movedId);
  });

  const seenPairKeys = new Set<string>();

  movedIds.forEach((movedId) => {
    const movedSegment = segmentsById.get(movedId)!;
    const movedEntry = cachedById.get(movedId)!;

    segmentsById.forEach((otherSegment, otherId) => {
      if (otherId === movedId) {
        return;
      }

      const otherEntry = cachedById.get(otherId)!;

      if (!boundingBoxesOverlap(movedEntry.bbox, otherEntry.bbox)) {
        return;
      }

      const pairKey = [movedId, otherId].sort().join(':');

      if (seenPairKeys.has(pairKey)) {
        return;
      }

      seenPairKeys.add(pairKey);

      addCrossingsForPair(
        movedSegment,
        otherSegment,
        movedEntry.points,
        otherEntry.points,
        vertices,
        crossingsBySegmentId,
        virtualVertices,
        segmentIdsByVertexId,
      );
    });
  });

  return { crossings: { crossingsBySegmentId, virtualVertices }, segmentIdsByVertexId };
};
