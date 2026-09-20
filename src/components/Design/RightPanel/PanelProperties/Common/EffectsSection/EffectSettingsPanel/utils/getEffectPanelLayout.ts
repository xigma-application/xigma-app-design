// others
import { EFFECT_NUMBER_FIELDS } from '../../constants';

// types
import { EffectType } from 'types/design/enums';

export type TEffectPanelLayout = {
  fields: readonly (typeof EFFECT_NUMBER_FIELDS)[number][];
  hasBlendMode: boolean;
  hasBlurModeToggle: boolean;
  hasColor: boolean;
};

export const getEffectPanelLayout = (type: EffectType): TEffectPanelLayout => {
  if (type === EffectType.layerBlur) {
    return {
      fields: EFFECT_NUMBER_FIELDS.filter(({ key }) => key === 'blur'),
      hasBlendMode: false,
      hasBlurModeToggle: true,
      hasColor: false,
    };
  }

  return { fields: EFFECT_NUMBER_FIELDS, hasBlendMode: true, hasBlurModeToggle: false, hasColor: true };
};
