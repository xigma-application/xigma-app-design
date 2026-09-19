// types
import { TEffect } from 'types/design/types';

export const toggleEffectVisibility = (effects: TEffect[], index: number): TEffect[] =>
  effects.map((effect, effectIndex) =>
    effectIndex === index ? { ...effect, visible: effect.visible === false ? undefined : false } : effect,
  );
