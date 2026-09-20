// types
import { TEffect } from 'types/design/types';

// utils
import { getProgressiveBlur } from 'utils/design/effects/getProgressiveBlur';
import { isProgressiveBlur } from 'utils/design/effects/isProgressiveBlur';

export const getEffectBlurAmount = (effect: TEffect | undefined): number => {
  if (effect && isProgressiveBlur(effect)) {
    const { endBlur, startBlur } = getProgressiveBlur(effect);
    return Math.max(startBlur, endBlur);
  }

  return effect?.blur ?? 0;
};
