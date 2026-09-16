import { useEffect } from 'react';

// types
import { ColorPickerTab } from '../enums';

export const useNotifyImageTabActiveState = (activeTab: ColorPickerTab, onImageTabActiveChange?: TFunc<[boolean]>): void => {
  useEffect(() => {
    onImageTabActiveChange?.(activeTab === ColorPickerTab.image);
  }, [activeTab, onImageTabActiveChange]);
};
