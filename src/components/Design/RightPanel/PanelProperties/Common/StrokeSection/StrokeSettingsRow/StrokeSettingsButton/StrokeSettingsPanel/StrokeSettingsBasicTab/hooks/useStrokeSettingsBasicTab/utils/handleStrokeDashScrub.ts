// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeDashLengthFromInput } from 'utils/design/stroke/getStrokeDashLengthFromInput';

export const handleStrokeDashScrub = (value: number, update: TCommitStrokeChanges): void => {
  const nextDash = getStrokeDashLengthFromInput(String(value));

  if (nextDash !== undefined) {
    update({ strokeDash: nextDash });
  }
};
