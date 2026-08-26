// types
import { TNetworkCrossings } from './types';
import { TSegmentCrossing } from '../types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { findOverlappingSegmentPairs } from './findOverlappingSegmentPairs';
import { findSegmentCrossings } from '../findSegmentCrossings';
import { getCachedFlattenedSegment } from './getCachedFlattenedSegment';
import { refineCrossing } from '../refineCrossing';

export const findAllNetworkCrossings = (segments: TVectorSegment[], vertices: Record<string, TVectorVertex>): TNetworkCrossings => {
  const cachedById = new Map(segments.map((segment) => [segment.id, getCachedFlattenedSegment(segment, vertices)]));
  const boundingBoxes = segments.map((segment, index) => ({ ...cachedById.get(segment.id)!.bbox, index }));
  const crossingsBySegmentId = new Map<string, TSegmentCrossing[]>();
  const virtualVertices: Record<string, TVectorVertex> = {};

  findOverlappingSegmentPairs(boundingBoxes).forEach(([i, j]) => {
    const a = segments[i];
    const b = segments[j];
    const pointsA = cachedById.get(a.id)!.points;
    const pointsB = cachedById.get(b.id)!.points;

    findSegmentCrossings(pointsA, pointsB).forEach((coarseCrossing) => {
      const crossing = refineCrossing(
        a,
        b,
        vertices,
        coarseCrossing.tA,
        1 / (pointsA.length - 1),
        coarseCrossing.tB,
        1 / (pointsB.length - 1),
      );
      const [firstId, secondId] = [a.id, b.id].sort();
      const vertexId = `x:${firstId}:${secondId}:${crossing.tA.toFixed(6)}`;

      virtualVertices[vertexId] = { id: vertexId, x: crossing.point.x, y: crossing.point.y };
      crossingsBySegmentId.set(a.id, [...(crossingsBySegmentId.get(a.id) ?? []), { t: crossing.tA, vertexId }]);
      crossingsBySegmentId.set(b.id, [...(crossingsBySegmentId.get(b.id) ?? []), { t: crossing.tB, vertexId }]);
    });
  });

  return { crossingsBySegmentId, virtualVertices };
};
