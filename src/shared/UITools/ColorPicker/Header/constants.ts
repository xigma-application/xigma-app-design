// components
import { TTab } from 'shared/UITools/Tabs/types';

// types
import { ColorPickerTab } from '../enums';

export const TABS: TTab[] = [
  { labelTranslationKey: 'colorPicker.tabs.solid', name: ColorPickerTab.solid },
  { labelTranslationKey: 'colorPicker.tabs.gradient', name: ColorPickerTab.gradient },
];

export const CUSTOM_LIBRARY_TABS: TTab[] = [
  { labelTranslationKey: 'colorPicker.tabs.custom', name: ColorPickerTab.solid },
  { disabled: true, labelTranslationKey: 'colorPicker.tabs.libraries', name: 'libraries' },
];
