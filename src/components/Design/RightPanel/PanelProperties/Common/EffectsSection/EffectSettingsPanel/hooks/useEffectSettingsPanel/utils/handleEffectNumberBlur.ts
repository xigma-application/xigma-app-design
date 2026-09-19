import { FocusEvent } from 'react';

// types
import { TEffect } from 'types/design/types';
import { TEffectNumberField } from '../../../../types';

// utils
import { getEffectNumberFromInput } from 'utils/design/effects/getEffectNumberFromInput';

export const handleEffectNumberBlur = (
  event: FocusEvent<HTMLInputElement>,
  field: TEffectNumberField,
  min: number,
  effect: TEffect,
  onChange: TFunc<[TEffect]>,
): void => {
  const next = getEffectNumberFromInput(event.target.value, min);

  if (next !== undefined && next !== effect[field]) {
    onChange({ ...effect, [field]: next });
  }

  event.target.value = `${next ?? effect[field]}`;
};
