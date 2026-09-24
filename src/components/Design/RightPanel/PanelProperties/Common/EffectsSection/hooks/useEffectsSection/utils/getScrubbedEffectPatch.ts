// others
import { EFFECT_FIELD_MAX } from '../../../constants';

// types
import { TEffect } from 'types/design/types';
import { TEffectNumberField } from '../../../types';

// utils
import { getEffectFieldValue } from 'utils/design/effects/getEffectFieldValue';
import { getEffectNumberFromInput } from 'utils/design/effects/getEffectNumberFromInput';

export const getScrubbedEffectPatch = (
  effect: TEffect,
  baseEffect: TEffect,
  field: TEffectNumberField,
  min: number,
  value: number,
): Partial<TEffect> => {
  const next = getEffectNumberFromInput(
    String(getEffectFieldValue(effect, field) + value - getEffectFieldValue(baseEffect, field)),
    min,
    EFFECT_FIELD_MAX[field],
  );

  return next === undefined ? {} : { [field]: next };
};
