// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';
import { TResolvedPieceUnit } from './types';

// utils
import { buildVertexRuns } from './buildVertexRuns';
import { getVectorPieceBoundaryKeys, TVectorPieceBoundaries } from '../getVectorPieceBoundaryKeys';

const PIECE_KEY_PATTERN = /^(.+)\[(.+)\|(.+)]$/;

export const resolvePieceKeyToUnit = (
  pieceKey: string,
  planarSegments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
  boundaryKeysByRealSegmentId: Map<string, Record<string, TVectorPieceBoundaries>>,
): TResolvedPieceUnit | null => {
  const match = PIECE_KEY_PATTERN.exec(pieceKey);

  if (match) {
    const [, realSegmentId, boundaryA, boundaryB] = match;
    const boundaryKeys =
      boundaryKeysByRealSegmentId.get(realSegmentId) ?? getVectorPieceBoundaryKeys(realSegmentId, planarSegments, vertices);

    boundaryKeysByRealSegmentId.set(realSegmentId, boundaryKeys);

    const runs = buildVertexRuns(Object.keys(boundaryKeys), boundaryKeys);
    const run = runs.find((candidate) => candidate.vertexSequence.includes(boundaryA) && candidate.vertexSequence.includes(boundaryB));

    if (run) {
      const indexA = run.vertexSequence.indexOf(boundaryA);
      const indexB = run.vertexSequence.indexOf(boundaryB);

      if (indexA !== indexB) {
        const [from, to] = indexA < indexB ? [indexA, indexB] : [indexB, indexA];
        const pieces = run.pieceIds.slice(from, to).map((pieceId) => planarSegments[pieceId]);

        return { endId: pieces[pieces.length - 1].endId, id: pieceKey, pieces, startId: pieces[0].startId };
      }
    }
  }

  return null;
};
