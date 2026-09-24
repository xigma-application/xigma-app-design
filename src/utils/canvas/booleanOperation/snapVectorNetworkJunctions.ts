// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getCanonicalVertexIds } from './getCanonicalVertexIds';
import { isStraightVectorSegment } from './isStraightVectorSegment';
import { splitStraightSegmentAtVertices } from './splitStraightSegmentAtVertices';

export type TVectorNetworkGeometry = { segments: Record<string, TVectorSegment>; vertices: Record<string, TVectorVertex> };

export const snapVectorNetworkJunctions = (
  segments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
): TVectorNetworkGeometry => {
  const canonicalIds = getCanonicalVertexIds(vertices);
  const canonicalVertices = Object.fromEntries(
    Object.values(vertices)
      .filter((vertex) => canonicalIds.get(vertex.id) === vertex.id)
      .map((vertex) => [vertex.id, vertex]),
  );
  const vertexList = Object.values(canonicalVertices);
  const seenStraightKeys = new Set<string>();
  const snappedSegments: Record<string, TVectorSegment> = {};

  Object.values(segments).forEach((segment) => {
    const remapped = {
      ...segment,
      endId: canonicalIds.get(segment.endId) ?? segment.endId,
      startId: canonicalIds.get(segment.startId) ?? segment.startId,
    };

    if (remapped.startId !== remapped.endId) {
      splitStraightSegmentAtVertices(remapped, canonicalVertices, vertexList).forEach((piece) => {
        const isStraight = isStraightVectorSegment(piece);
        const straightKey = [piece.startId, piece.endId].sort().join('|');

        if (!isStraight || !seenStraightKeys.has(straightKey)) {
          seenStraightKeys.add(straightKey);
          snappedSegments[piece.id] = piece;
        }
      });
    }
  });

  return { segments: snappedSegments, vertices: canonicalVertices };
};
