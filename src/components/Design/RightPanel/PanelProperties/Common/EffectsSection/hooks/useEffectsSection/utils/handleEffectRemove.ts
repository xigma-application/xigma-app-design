// types
import { TEffect } from 'types/design/types';

export const handleEffectRemove = (
  index: number,
  closeOpenPanel: TFunc,
  setSelectedIndices: TFunc<[number[]]>,
  commit: TFunc<[TFunc<[TEffect[]], TEffect[]>]>,
): void => {
  closeOpenPanel();
  setSelectedIndices([]);
  commit((nodeEffects) => nodeEffects.filter((_effect, effectIndex) => effectIndex !== index));
};
