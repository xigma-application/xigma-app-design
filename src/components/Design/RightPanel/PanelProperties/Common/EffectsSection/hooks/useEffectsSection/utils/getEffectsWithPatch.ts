// types
import { TEffect } from 'types/design/types';

export const getEffectsWithPatch = (effects: TEffect[], index: number, getPatch: TFunc<[TEffect], Partial<TEffect>>): TEffect[] =>
  effects.map((effect, effectIndex) => (effectIndex === index ? { ...effect, ...getPatch(effect) } : effect));
