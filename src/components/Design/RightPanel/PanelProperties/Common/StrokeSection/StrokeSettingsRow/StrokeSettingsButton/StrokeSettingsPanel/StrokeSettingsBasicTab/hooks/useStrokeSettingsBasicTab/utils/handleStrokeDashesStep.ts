// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeDashesFromInput } from 'utils/design/stroke/getStrokeDashesFromInput';

export const handleStrokeDashesStep = (text: string, dashes: number[], commit: TCommitStrokeChanges): void => {
  const nextDashes = getStrokeDashesFromInput(text);

  if (nextDashes && nextDashes.join(',') !== dashes.join(',')) {
    commit({ strokeDashes: nextDashes });
  }
};
