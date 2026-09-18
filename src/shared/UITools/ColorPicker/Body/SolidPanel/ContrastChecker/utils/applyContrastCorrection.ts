// types
import { THsv } from '../../../../types';

export const applyContrastCorrection = (target: THsv | null, onCorrect: TFunc<[THsv]>, onApplied: TFunc): void => {
  if (target) {
    onCorrect(target);
  }

  onApplied();
};
