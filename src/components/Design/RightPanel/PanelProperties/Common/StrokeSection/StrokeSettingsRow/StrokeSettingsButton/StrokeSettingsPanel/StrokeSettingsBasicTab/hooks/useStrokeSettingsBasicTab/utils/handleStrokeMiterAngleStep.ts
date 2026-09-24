// types
import { TCommitStrokeChanges } from '../types';

// utils
import { getStrokeMiterAngleFromInput } from 'utils/design/stroke/getStrokeMiterAngleFromInput';

export const handleStrokeMiterAngleStep = (text: string, miterAngle: number | undefined, commit: TCommitStrokeChanges): void => {
  const next = getStrokeMiterAngleFromInput(text);

  if (next !== undefined && next !== miterAngle) {
    commit({ strokeMiterAngle: next });
  }
};
