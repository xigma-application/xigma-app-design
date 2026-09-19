// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeMiterAngleFromInput } from 'utils/design/stroke/getStrokeMiterAngleFromInput';

export const handleStrokeMiterAngleScrub = (value: number, update: TCommitStrokeChanges): void => {
  const nextAngle = getStrokeMiterAngleFromInput(String(value));

  if (nextAngle !== undefined) {
    update({ strokeMiterAngle: nextAngle });
  }
};
