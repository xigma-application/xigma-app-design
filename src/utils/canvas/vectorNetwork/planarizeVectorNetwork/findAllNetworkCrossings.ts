// types
import { TPoint } from 'types/canvas';
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

type TBoundingBox = { maxX: number; maxY: number; minX: number; minY: number };

const getBoundingBox = (points: TPoint[]): TBoundingBox => {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  return { maxX: Math.max(...xs), maxY: Math.max(...ys), minX: Math.min(...xs), minY: Math.min(...ys) };
};

// A cheap pre-filter ahead of the real (curve-flattened) crossing search below — two segments whose
// bounding boxes don't even overlap can never cross, so skipping them here avoids the far more
// expensive findSegmentCrossings/refineCrossing pass entirely. Inclusive comparisons (<=) so touching
// boxes (e.g. two segments sharing an endpoint) still fall through to the real check, unchanged.
const boundingBoxesOverlap = (a: TBoundingBox, b: TBoundingBox): boolean =>
  a.minX <= b.maxX && b.minX <= a.maxX && a.minY <= b.maxY && b.minY <= a.maxY;

// Two segments sharing a vertex can still cross again somewhere else entirely — a curve whose tangent
// leaves its shared endpoint in one direction can loop back and cross a straight sibling edge further
// along, a real, separate crossing that must not be discarded. Segments are always searched for
// crossings regardless of whether they share a vertex — getStraightSegmentIntersection's own strict
// t>0/t<1 bounds already exclude the trivial touch at the shared endpoint itself, so no separate
// "shares a vertex" exclusion is needed on top of that.
export const findAllNetworkCrossings = (segments: TVectorSegment[], vertices: Record<string, TVectorVertex>): TNetworkCrossings => {
  const flattenedById = new Map(segments.map((segment) => [segment.id, flattenForCrossingSearch(segment, vertices)]));
  const boundingBoxById = new Map(Array.from(flattenedById, ([id, points]) => [id, getBoundingBox(points)]));
  const crossingsBySegmentId = new Map<string, TSegmentCrossing[]>();
  const virtualVertices: Record<string, TVectorVertex> = {};

  for (let i = 0; i < segments.length; i += 1) {
    for (let j = i + 1; j < segments.length; j += 1) {
      const a = segments[i];
      const b = segments[j];

      if (boundingBoxesOverlap(boundingBoxById.get(a.id)!, boundingBoxById.get(b.id)!)) {
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
