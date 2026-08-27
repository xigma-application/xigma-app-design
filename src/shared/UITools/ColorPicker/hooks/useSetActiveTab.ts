import { Dispatch, SetStateAction } from 'react';

// components
import { TTab } from 'shared/UITools/Tabs/types';

// types
import { ColorPickerTab } from '../enums';

const isColorPickerTab = (value: string): value is ColorPickerTab => value === ColorPickerTab.solid || value === ColorPickerTab.gradient;

export const useSetActiveTab =
  (setActiveTab: Dispatch<SetStateAction<ColorPickerTab>>): TFunc<[TTab['name']]> =>
  (tabName) => {
    if (isColorPickerTab(tabName)) {
      setActiveTab(tabName);
    }
  };
