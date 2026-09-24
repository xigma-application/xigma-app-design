import { FocusEvent } from 'react';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// types
import { TLayoutGuide } from 'types/design/types';

// utils
import { TLayoutGuideNumberField } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';
import { getEffectNumberFromInput } from 'utils/design/effects/getEffectNumberFromInput';

export const handleLayoutGuideNumberBlur = (
  event: FocusEvent<HTMLInputElement>,
  field: TLayoutGuideNumberField,
  min: number,
  current: number | undefined,
  onChange: TFunc<[Partial<TLayoutGuide>]>,
  unit = '',
): void => {
  const next = getEffectNumberFromInput(event.target.value, min);
  const value = next ?? current;

  if (next !== undefined && next !== current) {
    onChange({ [field]: next });
  }

  event.target.value = value === undefined ? MIXED_LABEL : `${value}${unit}`;
};
