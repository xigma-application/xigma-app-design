import { FocusEvent } from 'react';

// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeDashLengthFromInput } from 'utils/design/stroke/getStrokeDashLengthFromInput';

export const handleStrokeGapBlur = (event: FocusEvent<HTMLInputElement>, gap: number, commit: TCommitStrokeChanges): void => {
  const nextGap = getStrokeDashLengthFromInput(event.target.value);

  if (nextGap !== undefined && nextGap !== gap) {
    commit({ strokeGap: nextGap });
  }

  event.target.value = String(nextGap ?? gap);
};
