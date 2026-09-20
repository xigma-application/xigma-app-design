import { FocusEvent } from 'react';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';
import { TLayoutGuide } from 'types/design/types';

// utils
import { TLayoutGuideNumberField } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';
import { handleLayoutGuideNumberBlur } from './utils/handleLayoutGuideNumberBlur';
import { handleLayoutGuideNumberScrub } from './utils/handleLayoutGuideNumberScrub';

export type TUseLayoutGuideSettingsPanelResult = {
  onBlur: (field: TLayoutGuideNumberField, min: number, unit?: string) => TFunc<[FocusEvent<HTMLInputElement>]>;
  onCommitAlpha: TFunc<[number]>;
  onCommitHex: TFunc<[string]>;
  onPickerChange: TFunc<[TColorPickerValue]>;
  onScrub: (field: TLayoutGuideNumberField, min: number) => TFunc<[number]>;
};

export const useLayoutGuideSettingsPanel = (guide: TLayoutGuide, onChange: TFunc<[TLayoutGuide]>): TUseLayoutGuideSettingsPanelResult => ({
  onBlur: (field, min, unit) => (event) => handleLayoutGuideNumberBlur(event, field, min, guide, onChange, unit),
  onCommitAlpha: (opacity): void => onChange({ ...guide, opacity }),
  onCommitHex: (color): void => onChange({ ...guide, color }),
  onPickerChange: ({ alpha, hex }): void => onChange({ ...guide, color: hex, opacity: alpha }),
  onScrub: (field, min) => (value) => handleLayoutGuideNumberScrub(value, field, min, guide, onChange),
});
