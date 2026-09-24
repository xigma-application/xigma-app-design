import { FocusEvent } from 'react';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeDashesFromInput } from 'utils/design/stroke/getStrokeDashesFromInput';

export const handleStrokeDashesBlur = (
  event: FocusEvent<HTMLInputElement>,
  dashes: number[] | undefined,
  commit: TCommitStrokeChanges,
): void => {
  const nextDashes = getStrokeDashesFromInput(event.target.value);

  if (nextDashes && nextDashes.join(',') !== dashes?.join(',')) {
    commit({ strokeDashes: nextDashes });
  }

  event.target.value = (nextDashes ?? dashes)?.join(', ') ?? MIXED_LABEL;
};
