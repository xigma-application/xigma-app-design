// types
import { TEffect } from 'types/design/types';

// utils
import { getItemsWithPatch } from '../../../../utils/getItemsWithPatch';

export const getEffectsWithVisibility = (effects: TEffect[], index: number, isHidden: boolean): TEffect[] =>
  getItemsWithPatch(effects, index, () => ({ visible: isHidden ? undefined : false }));
