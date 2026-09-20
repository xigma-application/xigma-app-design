// types
import { EffectBlurType, EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

export const isProgressiveBlur = (effect: TEffect | undefined): boolean =>
  (effect?.type === EffectType.layerBlur || effect?.type === EffectType.backgroundBlur) && effect.blurType === EffectBlurType.progressive;
