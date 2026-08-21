// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorHalfEdgeAngle } from './getVectorHalfEdgeAngle';

export type TVectorHalfEdge = { segmentId: string; toId: string };

const getDistance = (a: TVectorVertex, b: TVectorVertex): number => Math.hypot(b.x - a.x, b.y - a.y);

export const buildVectorHalfEdgeAdjacency = (
  segments: TVectorSegment[],
  vertices: Record<string, TVectorVertex>,
): Map<string, TVectorHalfEdge[]> => {
  const adjacency = new Map<string, TVectorHalfEdge[]>();
  const segmentsById: Record<string, TVectorSegment> = {};

  const addHalfEdge = (fromId: string, edge: TVectorHalfEdge): void => {
    adjacency.set(fromId, [...(adjacency.get(fromId) ?? []), edge]);
  };

  segments.forEach((segment) => {
    segmentsById[segment.id] = segment;
    addHalfEdge(segment.startId, { segmentId: segment.id, toId: segment.endId });
    addHalfEdge(segment.endId, { segmentId: segment.id, toId: segment.startId });
  });

  adjacency.forEach((edges, fromId) => {
    edges.sort((a, b) => {
      const angleDelta =
        getVectorHalfEdgeAngle(segmentsById[a.segmentId], vertices[fromId], vertices[a.toId]) -
        getVectorHalfEdgeAngle(segmentsById[b.segmentId], vertices[fromId], vertices[b.toId]);

      return angleDelta !== 0
        ? angleDelta
        : getDistance(vertices[fromId], vertices[a.toId]) - getDistance(vertices[fromId], vertices[b.toId]);
    });
  });

  return adjacency;
};
