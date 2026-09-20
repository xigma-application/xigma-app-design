// types
import { EffectBlurType, EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

export const isProgressiveLayerBlur = (effect: TEffect | undefined): boolean =>
  effect?.type === EffectType.layerBlur && effect.blurType === EffectBlurType.progressive;
