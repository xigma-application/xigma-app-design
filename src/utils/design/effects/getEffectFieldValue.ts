// others
import { DEFAULT_NOISE_DENSITY, DEFAULT_NOISE_SIZE, DEFAULT_PROGRESSIVE_BLUR_START } from 'constant/effect';

// types
import { TEffect } from 'types/design/types';

const DEFAULTS: Partial<Record<TNumericEffectField, number>> = {
  density: DEFAULT_NOISE_DENSITY,
  noiseSize: DEFAULT_NOISE_SIZE,
  startBlur: DEFAULT_PROGRESSIVE_BLUR_START,
};

export type TNumericEffectField = 'blur' | 'density' | 'noiseSize' | 'spread' | 'startBlur' | 'x' | 'y';

export const getEffectFieldValue = (effect: TEffect, field: TNumericEffectField): number => effect[field] ?? DEFAULTS[field] ?? 0;
