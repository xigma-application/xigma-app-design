import { FocusEvent } from 'react';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeDashLengthFromInput } from 'utils/design/stroke/getStrokeDashLengthFromInput';

export const handleStrokeGapBlur = (event: FocusEvent<HTMLInputElement>, gap: number | undefined, commit: TCommitStrokeChanges): void => {
  const nextGap = getStrokeDashLengthFromInput(event.target.value);

  if (nextGap !== undefined && nextGap !== gap) {
    commit({ strokeGap: nextGap });
  }

  event.target.value = String(nextGap ?? gap ?? MIXED_LABEL);
};
