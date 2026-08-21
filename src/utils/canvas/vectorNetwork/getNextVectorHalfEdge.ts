// types
import { TVectorHalfEdge } from './buildVectorHalfEdgeAdjacency';

export const getNextVectorHalfEdge = (
  adjacency: Map<string, TVectorHalfEdge[]>,
  fromId: string,
  toId: string,
  segmentId: string,
): TVectorHalfEdge | null => {
  const outgoing = adjacency.get(toId) ?? [];
  const twinIndex = outgoing.findIndex((edge) => edge.segmentId === segmentId && edge.toId === fromId);

  if (twinIndex === -1) {
    return null;
  }

  return outgoing[(twinIndex - 1 + outgoing.length) % outgoing.length];
};
