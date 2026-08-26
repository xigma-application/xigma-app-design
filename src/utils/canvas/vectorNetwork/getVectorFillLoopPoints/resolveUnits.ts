// types
import { TResolvedPieceUnit } from './types';
import { TVectorPieceBoundaries } from '../getVectorPieceBoundaryKeys';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { resolvePieceKeyToUnit } from './resolvePieceKeyToUnit';

export const resolveUnits = (
  loopKey: string,
  planarSegments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
  boundaryKeysByRealSegmentId: Map<string, Record<string, TVectorPieceBoundaries>>,
): (TResolvedPieceUnit | null)[] =>
  loopKey.split(',').map((pieceKey) => resolvePieceKeyToUnit(pieceKey, planarSegments, vertices, boundaryKeysByRealSegmentId));
