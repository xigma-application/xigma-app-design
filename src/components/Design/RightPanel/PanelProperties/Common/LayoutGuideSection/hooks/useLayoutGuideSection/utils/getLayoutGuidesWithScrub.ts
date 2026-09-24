// types
import { TLayoutGuide } from 'types/design/types';

// utils
import { TLayoutGuideNumberField, getLayoutGuideFieldValue } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';
import { getEffectNumberFromInput } from 'utils/design/effects/getEffectNumberFromInput';
import { getItemsWithPatch } from '../../../../utils/getItemsWithPatch';

export const getLayoutGuidesWithScrub = (
  guides: TLayoutGuide[],
  index: number,
  baseGuide: TLayoutGuide,
  field: TLayoutGuideNumberField,
  min: number,
  value: number,
): TLayoutGuide[] =>
  getItemsWithPatch(guides, index, (guide) => {
    const next = getEffectNumberFromInput(
      String(getLayoutGuideFieldValue(guide, field) + value - getLayoutGuideFieldValue(baseGuide, field)),
      min,
    );

    return next === undefined ? {} : { [field]: next };
  });
