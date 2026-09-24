// types
import { TApplyStrokeBrushChanges, TOriginalStrokeBrush } from '../types';
import { TStrokeBrushValues } from 'utils/design/stroke/getStrokeBrushValues';

export const handleStrokeBrushCommit = (
  nextBrush: string,
  originalBrushes: TOriginalStrokeBrush[] | null,
  valuesList: TStrokeBrushValues[],
  onBrushRevert: TFunc,
  commit: TApplyStrokeBrushChanges,
): void => {
  const brushes = originalBrushes?.map(({ brush }) => brush) ?? valuesList.map((values) => values.brush);

  onBrushRevert();

  if (brushes.some((currentBrush) => currentBrush !== nextBrush)) {
    commit({ strokeBrush: nextBrush });
  }
};
