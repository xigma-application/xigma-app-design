import { FocusEvent } from 'react';

// types
import { TEffect } from 'types/design/types';
import { TEffectNumberField } from '../../../../types';

// others
import { EFFECT_FIELD_MAX } from '../../../../constants';
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// utils
import { getEffectNumberFromInput } from 'utils/design/effects/getEffectNumberFromInput';

export const handleEffectNumberBlur = (
  event: FocusEvent<HTMLInputElement>,
  field: TEffectNumberField,
  min: number,
  current: number | undefined,
  onChange: TFunc<[Partial<TEffect>]>,
  unit = '',
): void => {
  const next = getEffectNumberFromInput(event.target.value, min, EFFECT_FIELD_MAX[field]);
  const value = next ?? current;

  if (next !== undefined && next !== current) {
    onChange({ [field]: next });
  }

  event.target.value = value === undefined ? MIXED_LABEL : `${value}${unit}`;
};
