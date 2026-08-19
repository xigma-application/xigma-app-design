// types
import { TVectorSegment } from 'types/design/types';

export type TVectorHalfEdge = { segmentId: string; toId: string };

export const buildVectorHalfEdgeAdjacency = (segments: TVectorSegment[]): Map<string, TVectorHalfEdge[]> => {
  const adjacency = new Map<string, TVectorHalfEdge[]>();

  const addHalfEdge = (fromId: string, edge: TVectorHalfEdge): void => {
    adjacency.set(fromId, [...(adjacency.get(fromId) ?? []), edge]);
  };

  segments.forEach((segment) => {
    addHalfEdge(segment.startId, { segmentId: segment.id, toId: segment.endId });
    addHalfEdge(segment.endId, { segmentId: segment.id, toId: segment.startId });
  });

  return adjacency;
};
