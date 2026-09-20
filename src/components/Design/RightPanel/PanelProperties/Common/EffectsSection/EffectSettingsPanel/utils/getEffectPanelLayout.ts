// others
import {
  EFFECT_NOISE_FIELDS,
  EFFECT_NOISE_MULTI_FIELDS,
  EFFECT_NUMBER_FIELDS,
  EFFECT_PROGRESSIVE_BLUR_FIELDS,
  EFFECT_TEXTURE_FIELDS,
} from '../../constants';

// types
import { EffectNoiseType, EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';
import { TEffectField } from '../../types';

// utils
import { getEffectNoise } from 'utils/design/effects/getEffectNoise';
import { isProgressiveBlur } from 'utils/design/effects/isProgressiveBlur';

export type TEffectPanelLayout = {
  fields: readonly TEffectField[];
  hasBlendMode: boolean;
  hasBlurModeToggle: boolean;
  hasClipToShape: boolean;
  hasColor: boolean;
  hasGlassControls: boolean;
  hasNoiseTypeToggle: boolean;
  hasSecondaryColor: boolean;
};

const BLUR_LAYOUT = {
  hasBlendMode: false,
  hasBlurModeToggle: true,
  hasClipToShape: false,
  hasColor: false,
  hasGlassControls: false,
  hasNoiseTypeToggle: false,
  hasSecondaryColor: false,
};

export const getEffectPanelLayout = (effect: TEffect): TEffectPanelLayout => {
  switch (effect.type) {
    case EffectType.layerBlur:
    case EffectType.backgroundBlur:
      return {
        ...BLUR_LAYOUT,
        fields: isProgressiveBlur(effect) ? EFFECT_PROGRESSIVE_BLUR_FIELDS : EFFECT_NUMBER_FIELDS.filter(({ key }) => key === 'blur'),
      };
    case EffectType.noise:
      return {
        fields: getEffectNoise(effect).noiseType === EffectNoiseType.multi ? EFFECT_NOISE_MULTI_FIELDS : EFFECT_NOISE_FIELDS,
        hasBlendMode: true,
        hasBlurModeToggle: false,
        hasClipToShape: false,
        hasColor: getEffectNoise(effect).noiseType !== EffectNoiseType.multi,
        hasGlassControls: false,
        hasNoiseTypeToggle: true,
        hasSecondaryColor: getEffectNoise(effect).noiseType === EffectNoiseType.duo,
      };
    case EffectType.texture:
      return {
        fields: EFFECT_TEXTURE_FIELDS,
        hasBlendMode: false,
        hasBlurModeToggle: false,
        hasClipToShape: true,
        hasColor: false,
        hasGlassControls: false,
        hasNoiseTypeToggle: false,
        hasSecondaryColor: false,
      };
    case EffectType.glass:
      return {
        fields: [],
        hasBlendMode: false,
        hasBlurModeToggle: false,
        hasClipToShape: false,
        hasColor: false,
        hasGlassControls: true,
        hasNoiseTypeToggle: false,
        hasSecondaryColor: false,
      };
    default:
      return {
        fields: EFFECT_NUMBER_FIELDS,
        hasBlendMode: true,
        hasBlurModeToggle: false,
        hasClipToShape: false,
        hasColor: true,
        hasGlassControls: false,
        hasNoiseTypeToggle: false,
        hasSecondaryColor: false,
      };
  }
};
