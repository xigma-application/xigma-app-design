// types
import { TApplyStrokeBrushChanges } from '../types';

export const handleStrokeBrushCommit = (
  nextBrush: string,
  originalBrush: string,
  update: TApplyStrokeBrushChanges,
  commit: TApplyStrokeBrushChanges,
): void => {
  if (nextBrush !== originalBrush) {
    update({ strokeBrush: originalBrush });
    commit({ strokeBrush: nextBrush });
  }
};
