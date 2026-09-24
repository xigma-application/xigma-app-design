import { FocusEvent } from 'react';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeDashLengthFromInput } from 'utils/design/stroke/getStrokeDashLengthFromInput';

export const handleStrokeDashBlur = (event: FocusEvent<HTMLInputElement>, dash: number | undefined, commit: TCommitStrokeChanges): void => {
  const nextDash = getStrokeDashLengthFromInput(event.target.value);

  if (nextDash !== undefined && nextDash !== dash) {
    commit({ strokeDash: nextDash });
  }

  event.target.value = String(nextDash ?? dash ?? MIXED_LABEL);
};
