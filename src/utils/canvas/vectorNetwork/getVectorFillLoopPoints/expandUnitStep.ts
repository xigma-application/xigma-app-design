// types
import { TResolvedPieceUnit } from './types';
import { TVectorFaceStep } from '../walkVectorFace';

export const expandUnitStep = (step: TVectorFaceStep, unitsById: Map<string, TResolvedPieceUnit>): TVectorFaceStep[] => {
  const unit = unitsById.get(step.segmentId);
  const forward = unit!.startId === step.fromId;
  const orderedPieces = forward ? unit!.pieces : [...unit!.pieces].reverse();

  return orderedPieces.map((piece) => ({
    fromId: forward ? piece.startId : piece.endId,
    segmentId: piece.id,
    toId: forward ? piece.endId : piece.startId,
  }));
};
