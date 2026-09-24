import { FocusEvent } from 'react';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';
import { TLayoutGuide } from 'types/design/types';

// utils
import { TLayoutGuideNumberField, getLayoutGuideFieldValue } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';
import { handleLayoutGuideNumberBlur } from './utils/handleLayoutGuideNumberBlur';

export type TUseLayoutGuideSettingsPanelResult = {
  onBlur: (field: TLayoutGuideNumberField, min: number, unit?: string) => TFunc<[FocusEvent<HTMLInputElement>]>;
  onCommitAlpha: TFunc<[number]>;
  onCommitHex: TFunc<[string]>;
  onPickerChange: TFunc<[TColorPickerValue]>;
  onScrub: (field: TLayoutGuideNumberField, min: number) => TFunc<[number]>;
};

export const useLayoutGuideSettingsPanel = (
  guide: TLayoutGuide,
  mixedKeys: Set<keyof TLayoutGuide>,
  onChange: TFunc<[Partial<TLayoutGuide>]>,
  onFieldScrub: TFunc<[TLayoutGuideNumberField, number, number]>,
): TUseLayoutGuideSettingsPanelResult => ({
  onBlur: (field, min, unit) => (event) =>
    handleLayoutGuideNumberBlur(
      event,
      field,
      min,
      mixedKeys.has(field) ? undefined : getLayoutGuideFieldValue(guide, field),
      onChange,
      unit,
    ),
  onCommitAlpha: (opacity): void => onChange({ opacity }),
  onCommitHex: (color): void => onChange({ color }),
  onPickerChange: ({ alpha, hex }): void => onChange({ color: hex, opacity: alpha }),
  onScrub: (field, min) => (value) => onFieldScrub(field, min, value),
});
