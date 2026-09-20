// types
import { TEffect } from 'types/design/types';
import { TEffectNumberField } from '../../../../types';

// others
import { EFFECT_FIELD_MAX } from '../../../../constants';

// utils
import { getEffectNumberFromInput } from 'utils/design/effects/getEffectNumberFromInput';

export const handleEffectNumberScrub = (
  value: number,
  field: TEffectNumberField,
  min: number,
  effect: TEffect,
  onChange: TFunc<[TEffect]>,
): void => {
  const next = getEffectNumberFromInput(String(value), min, EFFECT_FIELD_MAX[field]);

  if (next !== undefined) {
    onChange({ ...effect, [field]: next });
  }
};
