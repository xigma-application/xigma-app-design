// types
import { TVectorPieceBoundaries } from '../getVectorPieceBoundaryKeys';

export type TVectorPieceRun = { pieceIds: string[]; vertexSequence: string[] };

// A real segment's surviving pieces (sorted by index) don't always form one unbroken chain —
// Shape Builder can delete a middle piece while keeping the outer ones, leaving a real gap where
// one piece's end no longer equals the next piece's start. Splits the pieces into independent
// contiguous runs instead of assuming they're always one continuous sequence, so a stored piece
// key's boundaries are only ever searched for within a run they could actually belong to.
export const buildVertexRuns = (pieceIds: string[], boundaryKeys: Record<string, TVectorPieceBoundaries>): TVectorPieceRun[] => {
  const runs: TVectorPieceRun[] = [];
  let currentPieceIds: string[] = [];
  let currentVertexSequence: string[] = [];

  pieceIds.forEach((pieceId) => {
    const { end, start } = boundaryKeys[pieceId];
    const isContiguous = currentVertexSequence[currentVertexSequence.length - 1] === start;

    if (!isContiguous && currentPieceIds.length > 0) {
      runs.push({ pieceIds: currentPieceIds, vertexSequence: currentVertexSequence });
      currentPieceIds = [];
      currentVertexSequence = [];
    }

    if (currentVertexSequence.length === 0) {
      currentVertexSequence.push(start);
    }

    currentPieceIds.push(pieceId);
    currentVertexSequence.push(end);
  });

  if (currentPieceIds.length > 0) {
    runs.push({ pieceIds: currentPieceIds, vertexSequence: currentVertexSequence });
  }

  return runs;
};
