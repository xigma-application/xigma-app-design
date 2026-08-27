// types
import { TColorPickerValue } from '../../types';

export const useSelectPreset =
  (onSelectPreset: TFunc<[TColorPickerValue]>) =>
  (preset: TColorPickerValue): TFunc =>
  () =>
    onSelectPreset(preset);
