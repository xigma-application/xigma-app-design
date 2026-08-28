// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

export type TVectorPieceBoundaries = { end: string; start: string };

const getPieceIndex = (pieceId: string): number => {
  const hashIndex = pieceId.indexOf('#');

  return hashIndex === -1 ? 0 : Number(pieceId.slice(hashIndex + 1));
};

const pieceIdGroupsCache = new WeakMap<Record<string, TVectorSegment>, Map<string, string[]>>();

const getPieceIdGroups = (planarSegments: Record<string, TVectorSegment>): Map<string, string[]> => {
  const cached = pieceIdGroupsCache.get(planarSegments);

  if (!cached) {
    const groups = new Map<string, string[]>();

    Object.keys(planarSegments).forEach((pieceId) => {
      const realSegmentId = pieceId.split('#')[0];
      const group = groups.get(realSegmentId) ?? [];

      group.push(pieceId);
      groups.set(realSegmentId, group);
    });
    groups.forEach((pieceIds) => pieceIds.sort((a, b) => getPieceIndex(a) - getPieceIndex(b)));
    pieceIdGroupsCache.set(planarSegments, groups);

    return groups;
  }

  return cached;
};

const resolveBoundaryKey = (
  vertexId: string,
  ownRealSegmentId: string,
  vertices: Record<string, TVectorVertex>,
  occurrenceBySegmentId: Map<string, number>,
  keyByVertexId: Map<string, string>,
): string => {
  if (vertexId in vertices) {
    return `v:${vertexId}`;
  }

  const cachedKey = keyByVertexId.get(vertexId);

  if (!cachedKey) {
    const [, firstId, secondId] = vertexId.split(':');
    const otherSegmentId = firstId === ownRealSegmentId ? secondId : firstId;
    const occurrence = occurrenceBySegmentId.get(otherSegmentId) ?? 0;
    const key = `x:${otherSegmentId}:${occurrence}`;

    occurrenceBySegmentId.set(otherSegmentId, occurrence + 1);
    keyByVertexId.set(vertexId, key);

    return key;
  }

  return cachedKey;
};

export const getVectorPieceBoundaryKeys = (
  realSegmentId: string,
  planarSegments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
): Record<string, TVectorPieceBoundaries> => {
  const pieceIds = getPieceIdGroups(planarSegments).get(realSegmentId) ?? [];

  const occurrenceBySegmentId = new Map<string, number>();
  const keyByVertexId = new Map<string, string>();

  return Object.fromEntries(
    pieceIds.map((pieceId) => {
      const piece = planarSegments[pieceId];

      return [
        pieceId,
        {
          end: resolveBoundaryKey(piece.endId, realSegmentId, vertices, occurrenceBySegmentId, keyByVertexId),
          start: resolveBoundaryKey(piece.startId, realSegmentId, vertices, occurrenceBySegmentId, keyByVertexId),
        },
      ];
    }),
  );
};
