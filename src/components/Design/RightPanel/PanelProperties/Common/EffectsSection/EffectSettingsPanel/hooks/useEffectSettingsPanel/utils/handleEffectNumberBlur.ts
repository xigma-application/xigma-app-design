import { FocusEvent } from 'react';

// types
import { TEffect } from 'types/design/types';
import { TEffectNumberField } from '../../../../types';

// others
import { EFFECT_FIELD_MAX } from '../../../../constants';

// utils
import { getEffectFieldValue } from 'utils/design/effects/getEffectFieldValue';
import { getEffectNumberFromInput } from 'utils/design/effects/getEffectNumberFromInput';

export const handleEffectNumberBlur = (
  event: FocusEvent<HTMLInputElement>,
  field: TEffectNumberField,
  min: number,
  effect: TEffect,
  onChange: TFunc<[TEffect]>,
  unit = '',
): void => {
  const next = getEffectNumberFromInput(event.target.value, min, EFFECT_FIELD_MAX[field]);

  if (next !== undefined && next !== getEffectFieldValue(effect, field)) {
    onChange({ ...effect, [field]: next });
  }

  event.target.value = `${next ?? getEffectFieldValue(effect, field)}${unit}`;
};
