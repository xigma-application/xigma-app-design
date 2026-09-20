// types
import { TLayoutGuide } from 'types/design/types';

// utils
import { TLayoutGuideNumberField } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';
import { getEffectNumberFromInput } from 'utils/design/effects/getEffectNumberFromInput';

export const handleLayoutGuideNumberScrub = (
  value: number,
  field: TLayoutGuideNumberField,
  min: number,
  guide: TLayoutGuide,
  onChange: TFunc<[TLayoutGuide]>,
): void => {
  const next = getEffectNumberFromInput(String(value), min);

  if (next !== undefined) {
    onChange({ ...guide, [field]: next });
  }
};
