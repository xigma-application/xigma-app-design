// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeDashLengthFromInput } from 'utils/design/stroke/getStrokeDashLengthFromInput';

export const handleStrokeGapStep = (text: string, gap: number | undefined, commit: TCommitStrokeChanges): void => {
  const next = getStrokeDashLengthFromInput(text);

  if (next !== undefined && next !== gap) {
    commit({ strokeGap: next });
  }
};
