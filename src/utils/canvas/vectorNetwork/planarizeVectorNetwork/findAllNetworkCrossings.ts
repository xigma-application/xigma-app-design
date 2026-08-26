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

const boundingBoxesOverlap = (a: TBoundingBox, b: TBoundingBox): boolean =>
  a.minX <= b.maxX && b.minX <= a.maxX && a.minY <= b.maxY && b.minY <= a.maxY;

type TIndexedBoundingBox = TBoundingBox & { index: number };

const findOverlappingSegmentPairs = (boundingBoxes: TIndexedBoundingBox[]): [number, number][] => {
  const sortedByMinX = [...boundingBoxes].sort((a, b) => a.minX - b.minX);
  const pairs: [number, number][] = [];
  let active: TIndexedBoundingBox[] = [];

  sortedByMinX.forEach((current) => {
    active = active.filter((entry) => entry.maxX >= current.minX);

    active.forEach((entry) => {
      if (boundingBoxesOverlap(current, entry)) {
        pairs.push(entry.index < current.index ? [entry.index, current.index] : [current.index, entry.index]);
      }
    });

    active.push(current);
  });

  return pairs;
};

export const findAllNetworkCrossings = (segments: TVectorSegment[], vertices: Record<string, TVectorVertex>): TNetworkCrossings => {
  const flattenedById = new Map(segments.map((segment) => [segment.id, flattenForCrossingSearch(segment, vertices)]));
  const boundingBoxes = segments.map((segment, index) => ({ ...getBoundingBox(flattenedById.get(segment.id)!), index }));
  const crossingsBySegmentId = new Map<string, TSegmentCrossing[]>();
  const virtualVertices: Record<string, TVectorVertex> = {};

  findOverlappingSegmentPairs(boundingBoxes).forEach(([i, j]) => {
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
  });

  return { crossingsBySegmentId, virtualVertices };
};
