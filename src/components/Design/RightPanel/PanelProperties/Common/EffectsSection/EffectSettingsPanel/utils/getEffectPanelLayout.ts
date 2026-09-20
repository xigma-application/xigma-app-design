// others
import { EFFECT_NUMBER_FIELDS, EFFECT_PROGRESSIVE_BLUR_FIELDS } from '../../constants';

// types
import { TEffect } from 'types/design/types';
import { TEffectField } from '../../types';

// utils
import { EffectType } from 'types/design/enums';
import { isProgressiveLayerBlur } from 'utils/design/effects/isProgressiveLayerBlur';

export type TEffectPanelLayout = {
  fields: readonly TEffectField[];
  hasBlendMode: boolean;
  hasBlurModeToggle: boolean;
  hasColor: boolean;
};

export const getEffectPanelLayout = (effect: TEffect): TEffectPanelLayout => {
  if (effect.type === EffectType.layerBlur) {
    return {
      fields: isProgressiveLayerBlur(effect) ? EFFECT_PROGRESSIVE_BLUR_FIELDS : EFFECT_NUMBER_FIELDS.filter(({ key }) => key === 'blur'),
      hasBlendMode: false,
      hasBlurModeToggle: true,
      hasColor: false,
    };
  }

  return { fields: EFFECT_NUMBER_FIELDS, hasBlendMode: true, hasBlurModeToggle: false, hasColor: true };
};
