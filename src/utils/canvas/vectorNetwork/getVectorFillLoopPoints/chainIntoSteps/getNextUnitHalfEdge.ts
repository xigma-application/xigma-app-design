// types
import { TResolvedPieceUnit } from '../types';
import { TVectorHalfEdge } from '../../buildVectorHalfEdgeAdjacency';

export const getNextUnitHalfEdgeCandidates = (
  fullAdjacency: Map<string, TVectorHalfEdge[]>,
  unitByBoundaryPieceId: Map<string, TResolvedPieceUnit>,
  fromId: string,
  toId: string,
  currentUnit: TResolvedPieceUnit,
): TVectorHalfEdge[] => {
  const arrivingPiece = fromId === currentUnit.startId ? currentUnit.pieces[currentUnit.pieces.length - 1] : currentUnit.pieces[0];
  const outgoing = fullAdjacency.get(toId) ?? [];
  const twinIndex = outgoing.findIndex((edge) => edge.segmentId === arrivingPiece.id);

  if (twinIndex !== -1) {
    const candidates: TVectorHalfEdge[] = [];

    for (let offset = 1; offset <= outgoing.length; offset += 1) {
      const candidate = outgoing[(twinIndex - offset + outgoing.length) % outgoing.length];
      const candidateUnit = unitByBoundaryPieceId.get(candidate.segmentId);

      if (candidateUnit && candidateUnit.id !== currentUnit.id) {
        const outgoingToId = toId === candidateUnit.startId ? candidateUnit.endId : candidateUnit.startId;

        candidates.push({ segmentId: candidateUnit.id, toId: outgoingToId });
      }
    }

    return candidates;
  }

  return [];
};
