// types
import { TEffect } from 'types/design/types';

// utils
import { getEffectsWithPatch } from './getEffectsWithPatch';

export const getEffectsWithVisibility = (effects: TEffect[], index: number, isHidden: boolean): TEffect[] =>
  getEffectsWithPatch(effects, index, () => ({ visible: isHidden ? undefined : false }));
