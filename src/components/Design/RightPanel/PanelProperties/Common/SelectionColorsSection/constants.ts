// types
import { ColorPickerTab } from 'shared/UITools/ColorPicker/enums';

// others
import { translationNameSpace as parentNameSpace } from '../constants';

export const translationNameSpace = `${parentNameSpace}.selectionColorsSection`;

export const SELECTION_COLOR_TABS: ColorPickerTab[] = [ColorPickerTab.solid, ColorPickerTab.gradient, ColorPickerTab.shader];

export const MAX_SELECTION_COLOR_PREVIEW = 3;
