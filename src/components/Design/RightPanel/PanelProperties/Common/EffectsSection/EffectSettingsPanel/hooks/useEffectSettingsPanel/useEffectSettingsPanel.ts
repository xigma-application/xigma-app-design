import { FocusEvent } from 'react';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';
import { TEffect } from 'types/design/types';
import { TEffectNumberField } from '../../../types';

// utils
import { getEffectFieldValue } from 'utils/design/effects/getEffectFieldValue';
import { handleEffectNumberBlur } from './utils/handleEffectNumberBlur';

export type TUseEffectSettingsPanelResult = {
  onBlur: (field: TEffectNumberField, min: number, unit?: string) => TFunc<[FocusEvent<HTMLInputElement>]>;
  onCommitAlpha: TFunc<[number]>;
  onCommitHex: TFunc<[string]>;
  onCommitSecondaryAlpha: TFunc<[number]>;
  onCommitSecondaryHex: TFunc<[string]>;
  onPickerChange: TFunc<[TColorPickerValue]>;
  onSecondaryPickerChange: TFunc<[TColorPickerValue]>;
  onScrub: (field: TEffectNumberField, min: number) => TFunc<[number]>;
};

export const useEffectSettingsPanel = (
  effect: TEffect,
  mixedKeys: Set<keyof TEffect>,
  onChange: TFunc<[Partial<TEffect>]>,
  onFieldScrub: TFunc<[TEffectNumberField, number, number]>,
): TUseEffectSettingsPanelResult => ({
  onBlur: (field, min, unit) => (event) =>
    handleEffectNumberBlur(event, field, min, mixedKeys.has(field) ? undefined : getEffectFieldValue(effect, field), onChange, unit),
  onCommitAlpha: (opacity): void => onChange({ opacity }),
  onCommitHex: (color): void => onChange({ color }),
  onCommitSecondaryAlpha: (secondaryOpacity): void => onChange({ secondaryOpacity }),
  onCommitSecondaryHex: (secondaryColor): void => onChange({ secondaryColor }),
  onPickerChange: ({ alpha, hex }): void => onChange({ color: hex, opacity: alpha }),
  onScrub: (field, min) => (value) => onFieldScrub(field, min, value),
  onSecondaryPickerChange: ({ alpha, hex }): void => onChange({ secondaryColor: hex, secondaryOpacity: alpha }),
});
