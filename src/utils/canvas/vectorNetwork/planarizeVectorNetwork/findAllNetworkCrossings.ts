// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';
import { TSegmentCrossing } from './types';

// utils
import { flattenForCrossingSearch } from './flattenForCrossingSearch';
import { findSegmentCrossings } from './findSegmentCrossings';
import { refineCrossing } from './refineCrossing';
import { sharesVertex } from './sharesVertex';

export type TNetworkCrossings = {
  crossingsBySegmentId: Map<string, TSegmentCrossing[]>;
  virtualVertices: Record<string, TVectorVertex>;
};

export const findAllNetworkCrossings = (segments: TVectorSegment[], vertices: Record<string, TVectorVertex>): TNetworkCrossings => {
  const flattenedById = new Map(segments.map((segment) => [segment.id, flattenForCrossingSearch(segment, vertices)]));
  const crossingsBySegmentId = new Map<string, TSegmentCrossing[]>();
  const virtualVertices: Record<string, TVectorVertex> = {};

  for (let i = 0; i < segments.length; i += 1) {
    for (let j = i + 1; j < segments.length; j += 1) {
      const a = segments[i];
      const b = segments[j];

      if (!sharesVertex(a, b)) {
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
  }

  return { crossingsBySegmentId, virtualVertices };
};
