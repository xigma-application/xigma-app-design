// types
import { TEffect } from 'types/design/types';
import { TEffectNumberField } from '../../../types';

// utils
import { getItemsWithPatch } from '../../../../utils/getItemsWithPatch';
import { getScrubbedEffectPatch } from './getScrubbedEffectPatch';

export const getEffectsWithScrub = (
  effects: TEffect[],
  index: number,
  baseEffect: TEffect,
  field: TEffectNumberField,
  min: number,
  value: number,
): TEffect[] => getItemsWithPatch(effects, index, (effect) => getScrubbedEffectPatch(effect, baseEffect, field, min, value));
