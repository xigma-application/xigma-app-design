// types
import { EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';

export const handleEffectAdd = (
  type: EffectType,
  isMixed: boolean,
  effectsLength: number,
  commit: TFunc<[TFunc<[TEffect[]], TEffect[]>]>,
  setSelectedIndices: TFunc<[number[]]>,
  onPickerOpenChange: (index: number, isOpen: boolean) => void,
): void => {
  commit((nodeEffects) => [...(isMixed ? [] : nodeEffects), createEffect(type)]);
  setSelectedIndices([effectsLength]);
  onPickerOpenChange(effectsLength, true);
};
