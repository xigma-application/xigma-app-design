// types
import { TEffect } from 'types/design/types';

export const getReorderedEffects = (nodeEffects: TEffect[], shownEffects: TEffect[], reorderedEffects: TEffect[]): TEffect[] =>
  reorderedEffects.map((effect) => nodeEffects[shownEffects.indexOf(effect)] ?? effect);
