import { useEffect } from 'react';

// types
import { ColorPickerTab } from '../enums';

export const useNotifyVideoTabActiveState = (activeTab: ColorPickerTab, onVideoTabActiveChange?: TFunc<[boolean]>): void => {
  useEffect(() => {
    onVideoTabActiveChange?.(activeTab === ColorPickerTab.video);
  }, [activeTab, onVideoTabActiveChange]);
};
