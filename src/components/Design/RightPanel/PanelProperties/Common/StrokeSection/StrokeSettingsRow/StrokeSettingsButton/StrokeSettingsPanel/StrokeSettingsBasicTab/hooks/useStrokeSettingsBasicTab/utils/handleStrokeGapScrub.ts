// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeDashLengthFromInput } from 'utils/design/stroke/getStrokeDashLengthFromInput';

export const handleStrokeGapScrub = (value: number, update: TCommitStrokeChanges): void => {
  const nextGap = getStrokeDashLengthFromInput(String(value));

  if (nextGap !== undefined) {
    update({ strokeGap: nextGap });
  }
};
