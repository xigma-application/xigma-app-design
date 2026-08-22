// types
import { TVectorPieceBoundaries } from '../getVectorPieceBoundaryKeys';

export const buildVertexSequence = (pieceIds: string[], boundaryKeys: Record<string, TVectorPieceBoundaries>): string[] => [
  boundaryKeys[pieceIds[0]].start,
  ...pieceIds.map((pieceId) => boundaryKeys[pieceId].end),
];
