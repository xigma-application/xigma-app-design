// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';
import { TSegmentCrossing } from './types';

// utils
import { flattenForCrossingSearch } from './flattenForCrossingSearch';
import { findSegmentCrossings } from './findSegmentCrossings';
import { refineCrossing } from './refineCrossing';

export type TNetworkCrossings = {
  crossingsBySegmentId: Map<string, TSegmentCrossing[]>;
  virtualVertices: Record<string, TVectorVertex>;
};

// Two segments sharing a vertex can still cross again somewhere else entirely — a curve whose tangent
// leaves its shared endpoint in one direction can loop back and cross a straight sibling edge further
// along, a real, separate crossing that must not be discarded. Segments are always searched for
// crossings regardless of whether they share a vertex — getStraightSegmentIntersection's own strict
// t>0/t<1 bounds already exclude the trivial touch at the shared endpoint itself, so no separate
// "shares a vertex" exclusion is needed on top of that.
export const findAllNetworkCrossings = (segments: TVectorSegment[], vertices: Record<string, TVectorVertex>): TNetworkCrossings => {
  const flattenedById = new Map(segments.map((segment) => [segment.id, flattenForCrossingSearch(segment, vertices)]));
  const crossingsBySegmentId = new Map<string, TSegmentCrossing[]>();
  const virtualVertices: Record<string, TVectorVertex> = {};

  for (let i = 0; i < segments.length; i += 1) {
    for (let j = i + 1; j < segments.length; j += 1) {
      const a = segments[i];
      const b = segments[j];
      const pointsA = flattenedById.get(a.id)!;
      const pointsB = flattenedById.get(b.id)!;

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
    }
  }

  return { crossingsBySegmentId, virtualVertices };
};
