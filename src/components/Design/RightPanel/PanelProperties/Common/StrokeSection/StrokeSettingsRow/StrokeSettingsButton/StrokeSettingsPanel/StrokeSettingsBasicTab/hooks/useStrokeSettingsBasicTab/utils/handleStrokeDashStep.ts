// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeDashLengthFromInput } from 'utils/design/stroke/getStrokeDashLengthFromInput';

export const handleStrokeDashStep = (text: string, dash: number, commit: TCommitStrokeChanges): void => {
  const next = getStrokeDashLengthFromInput(text);

  if (next !== undefined && next !== dash) {
    commit({ strokeDash: next });
  }
};
