// others
import { EFFECT_NOISE_FIELDS, EFFECT_NUMBER_FIELDS, EFFECT_PROGRESSIVE_BLUR_FIELDS } from '../../constants';

// types
import { EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';
import { TEffectField } from '../../types';

// utils
import { isProgressiveBlur } from 'utils/design/effects/isProgressiveBlur';

export type TEffectPanelLayout = {
  fields: readonly TEffectField[];
  hasBlendMode: boolean;
  hasBlurModeToggle: boolean;
  hasColor: boolean;
  hasNoiseTypeToggle: boolean;
};

const BLUR_LAYOUT = { hasBlendMode: false, hasBlurModeToggle: true, hasColor: false, hasNoiseTypeToggle: false };

export const getEffectPanelLayout = (effect: TEffect): TEffectPanelLayout => {
  switch (effect.type) {
    case EffectType.layerBlur:
    case EffectType.backgroundBlur:
      return {
        ...BLUR_LAYOUT,
        fields: isProgressiveBlur(effect) ? EFFECT_PROGRESSIVE_BLUR_FIELDS : EFFECT_NUMBER_FIELDS.filter(({ key }) => key === 'blur'),
      };
    case EffectType.noise:
      return { fields: EFFECT_NOISE_FIELDS, hasBlendMode: true, hasBlurModeToggle: false, hasColor: true, hasNoiseTypeToggle: true };
    default:
      return { fields: EFFECT_NUMBER_FIELDS, hasBlendMode: true, hasBlurModeToggle: false, hasColor: true, hasNoiseTypeToggle: false };
  }
};
