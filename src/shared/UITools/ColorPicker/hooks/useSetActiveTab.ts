import { Dispatch, SetStateAction } from 'react';

// components
import { TTab } from 'shared/UITools/Tabs/types';

// types
import { ColorPickerTab } from '../enums';
import { TColorPickerValue } from '../types';
import { TGradientPanelChange } from '../Body/GradientPanel/types';
import { TUseGradientPanelResult } from '../Body/GradientPanel/hooks/useGradientPanel/useGradientPanel';

const isColorPickerTab = (value: string): value is ColorPickerTab => value === ColorPickerTab.solid || value === ColorPickerTab.gradient;

export const useSetActiveTab =
  (
    setActiveTab: Dispatch<SetStateAction<ColorPickerTab>>,
    onChange: TFunc<[TColorPickerValue]>,
    value: TColorPickerValue,
    gradientPanel: TUseGradientPanelResult,
    onGradientChange?: TFunc<[TGradientPanelChange]>,
  ): TFunc<[TTab['name']]> =>
  (tabName) => {
    if (isColorPickerTab(tabName)) {
      setActiveTab(tabName);

      if (tabName === ColorPickerTab.gradient) {
        onGradientChange?.({ angle: gradientPanel.angle, stops: gradientPanel.stops, type: gradientPanel.type });
      } else {
        onChange(value);
      }
    }
  };
