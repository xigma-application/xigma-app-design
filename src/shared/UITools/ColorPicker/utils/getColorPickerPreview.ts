// types
import { ColorPickerTab } from '../enums';
import { TColorPickerPreview, TColorPickerValue } from '../types';
import { TEditableGradientStop, TGradientType } from '../Body/GradientPanel/types';

// utils
import { getGradientPreviewStyle } from './getGradientPreviewStyle';

export const getColorPickerPreview = (
  activeTab: ColorPickerTab,
  stops: TEditableGradientStop[],
  type: TGradientType,
  angle: number,
  value: TColorPickerValue,
): TColorPickerPreview =>
  activeTab === ColorPickerTab.gradient
    ? { style: getGradientPreviewStyle(stops, type, angle), type: 'gradient' }
    : { type: 'solid', value };
