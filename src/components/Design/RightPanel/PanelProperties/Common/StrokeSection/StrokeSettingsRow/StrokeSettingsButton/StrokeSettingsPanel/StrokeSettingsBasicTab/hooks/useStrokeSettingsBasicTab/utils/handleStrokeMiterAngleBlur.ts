import { FocusEvent } from 'react';

// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeMiterAngleFromInput } from 'utils/design/stroke/getStrokeMiterAngleFromInput';

export const handleStrokeMiterAngleBlur = (event: FocusEvent<HTMLInputElement>, miterAngle: number, commit: TCommitStrokeChanges): void => {
  const nextAngle = getStrokeMiterAngleFromInput(event.target.value);

  if (nextAngle !== undefined && nextAngle !== miterAngle) {
    commit({ strokeMiterAngle: nextAngle });
  }

  event.target.value = `${nextAngle ?? miterAngle}°`;
};
