// others
import { DEFAULT_PROGRESSIVE_BLUR_START } from 'constant/effect';

// types
import { TEffect } from 'types/design/types';

export const getEffectFieldValue = (effect: TEffect, field: keyof Pick<TEffect, 'blur' | 'spread' | 'startBlur' | 'x' | 'y'>): number =>
  field === 'startBlur' ? (effect.startBlur ?? DEFAULT_PROGRESSIVE_BLUR_START) : effect[field];
