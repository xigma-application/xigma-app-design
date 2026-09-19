import { FocusEvent } from 'react';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';
import { TEffect } from 'types/design/types';
import { TEffectNumberField } from '../../../types';

// utils
import { handleEffectNumberBlur } from './utils/handleEffectNumberBlur';

export type TUseEffectSettingsPanelResult = {
  onBlur: (field: TEffectNumberField, min: number) => TFunc<[FocusEvent<HTMLInputElement>]>;
  onCommitAlpha: TFunc<[number]>;
  onCommitHex: TFunc<[string]>;
  onPickerChange: TFunc<[TColorPickerValue]>;
};

export const useEffectSettingsPanel = (effect: TEffect, onChange: TFunc<[TEffect]>): TUseEffectSettingsPanelResult => ({
  onBlur: (field, min) => (event) => handleEffectNumberBlur(event, field, min, effect, onChange),
  onCommitAlpha: (opacity): void => onChange({ ...effect, opacity }),
  onCommitHex: (color): void => onChange({ ...effect, color }),
  onPickerChange: ({ alpha, hex }): void => onChange({ ...effect, color: hex, opacity: alpha }),
});
