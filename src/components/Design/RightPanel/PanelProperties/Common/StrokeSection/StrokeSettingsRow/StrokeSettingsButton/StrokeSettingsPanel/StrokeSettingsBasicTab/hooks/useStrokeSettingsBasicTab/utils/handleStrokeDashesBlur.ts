import { FocusEvent } from 'react';

// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeDashesFromInput } from 'utils/design/stroke/getStrokeDashesFromInput';

export const handleStrokeDashesBlur = (event: FocusEvent<HTMLInputElement>, dashes: number[], commit: TCommitStrokeChanges): void => {
  const nextDashes = getStrokeDashesFromInput(event.target.value);

  if (nextDashes && nextDashes.join(',') !== dashes.join(',')) {
    commit({ strokeDashes: nextDashes });
  }

  event.target.value = (nextDashes ?? dashes).join(', ');
};
