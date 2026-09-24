import { FocusEvent } from 'react';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeMiterAngleFromInput } from 'utils/design/stroke/getStrokeMiterAngleFromInput';

export const handleStrokeMiterAngleBlur = (
  event: FocusEvent<HTMLInputElement>,
  miterAngle: number | undefined,
  commit: TCommitStrokeChanges,
): void => {
  const nextAngle = getStrokeMiterAngleFromInput(event.target.value);

  if (nextAngle !== undefined && nextAngle !== miterAngle) {
    commit({ strokeMiterAngle: nextAngle });
  }

  const angle = nextAngle ?? miterAngle;
  event.target.value = angle === undefined ? MIXED_LABEL : `${angle}°`;
};
