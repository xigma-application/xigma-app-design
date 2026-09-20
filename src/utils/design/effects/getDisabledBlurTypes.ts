// types
import { EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

const BLUR_TYPES: EffectType[] = [EffectType.layerBlur, EffectType.backgroundBlur];

export const getDisabledBlurTypes = (effects: TEffect[], editingIndex?: number): EffectType[] =>
  effects.some((effect, index) => index !== editingIndex && BLUR_TYPES.includes(effect.type)) ? BLUR_TYPES : [];
