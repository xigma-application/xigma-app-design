import { FocusEvent } from 'react';

// types
import { TLayoutGuide } from 'types/design/types';

// utils
import { TLayoutGuideNumberField, getLayoutGuideFieldValue } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';
import { getEffectNumberFromInput } from 'utils/design/effects/getEffectNumberFromInput';

export const handleLayoutGuideNumberBlur = (
  event: FocusEvent<HTMLInputElement>,
  field: TLayoutGuideNumberField,
  min: number,
  guide: TLayoutGuide,
  onChange: TFunc<[TLayoutGuide]>,
  unit = '',
): void => {
  const next = getEffectNumberFromInput(event.target.value, min);

  if (next !== undefined && next !== getLayoutGuideFieldValue(guide, field)) {
    onChange({ ...guide, [field]: next });
  }

  event.target.value = `${next ?? getLayoutGuideFieldValue(guide, field)}${unit}`;
};
