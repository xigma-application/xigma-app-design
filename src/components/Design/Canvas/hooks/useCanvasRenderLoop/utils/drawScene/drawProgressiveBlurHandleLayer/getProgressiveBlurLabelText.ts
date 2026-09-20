// others
import { PROGRESSIVE_BLUR_LABELS } from './constants';

// types
import { TEffect } from 'types/design/types';
import { TProgressiveBlurEndpoint } from 'types/design/canvas/types';

// utils
import { getProgressiveBlur } from 'utils/design/effects/getProgressiveBlur';

export const getProgressiveBlurLabelText = (effect: TEffect, endpoint: TProgressiveBlurEndpoint): string => {
  const { endBlur, startBlur } = getProgressiveBlur(effect);
  const value = endpoint === 'start' ? startBlur : endBlur;

  return `${PROGRESSIVE_BLUR_LABELS[endpoint]} ${Math.round(value * 100) / 100}`;
};
