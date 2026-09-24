// types
import { BlendMode, EffectBlurType, EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

// utils
import { getEffectFieldValue } from 'utils/design/effects/getEffectFieldValue';
import { getEffectGlass } from 'utils/design/effects/getEffectGlass';
import { getEffectNoise } from 'utils/design/effects/getEffectNoise';
import { getEffectTexture } from 'utils/design/effects/getEffectTexture';

export const getEffectComparable = (effect: TEffect): TEffect => ({
  ...effect,
  ...getEffectGlass(effect),
  ...getEffectNoise(effect),
  blendMode: effect.blendMode ?? BlendMode.normal,
  blurType: effect.blurType ?? EffectBlurType.uniform,
  clipToShape: getEffectTexture(effect).clipToShape,
  noiseSize: effect.type === EffectType.texture ? getEffectTexture(effect).size : getEffectNoise(effect).noiseSize,
  radius: getEffectFieldValue(effect, 'radius'),
  startBlur: getEffectFieldValue(effect, 'startBlur'),
  visible: effect.visible !== false,
});
