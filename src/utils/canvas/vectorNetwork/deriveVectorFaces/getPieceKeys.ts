// types
import { TVectorFaceStep } from '../walkVectorFace';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorFillPieceKey } from '../getVectorFillPieceKey';
import { getVectorPieceBoundaryKeys, type TVectorPieceBoundaries } from '../getVectorPieceBoundaryKeys';

export const getPieceKeys = (
  steps: TVectorFaceStep[],
  planarSegments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
  boundaryKeysByRealSegmentId: Map<string, Record<string, TVectorPieceBoundaries>>,
): string[] => [
  ...new Set(
    steps.map((step) => {
      const realSegmentId = step.segmentId.split('#')[0];
      const boundaryKeys =
        boundaryKeysByRealSegmentId.get(realSegmentId) ?? getVectorPieceBoundaryKeys(realSegmentId, planarSegments, vertices);

      boundaryKeysByRealSegmentId.set(realSegmentId, boundaryKeys);

      return getVectorFillPieceKey(realSegmentId, boundaryKeys[step.segmentId]);
    }),
  ),
];
