// types
import { TVectorPieceBoundaries } from './getVectorPieceBoundaryKeys';

export const getVectorFillPieceKey = (realSegmentId: string, boundaries: TVectorPieceBoundaries): string =>
  `${realSegmentId}[${[boundaries.start, boundaries.end].sort().join('|')}]`;
