import { Dispatch, SetStateAction } from 'react';

// components
import { TTab } from 'shared/UITools/Tabs/types';

// types
import { ColorPickerTab } from '../enums';
import { TColorPickerValue } from '../types';
import { TGradientPanelChange } from '../Body/GradientPanel/types';
import { TImagePanelChange } from '../Body/ImagePanel/types';
import { TPatternPanelChange } from '../Body/PatternPanel/types';
import { TUseGradientPanelResult } from '../Body/GradientPanel/hooks/useGradientPanel/useGradientPanel';
import { TUsePatternPanelResult } from '../Body/PatternPanel/hooks/usePatternPanel';
import { TVideoPanelChange } from '../Body/VideoPanel/types';

const isColorPickerTab = (value: string): value is ColorPickerTab =>
  value === ColorPickerTab.solid ||
  value === ColorPickerTab.gradient ||
  value === ColorPickerTab.pattern ||
  value === ColorPickerTab.image ||
  value === ColorPickerTab.video;

export const useSetActiveTab =
  (
    activeTab: ColorPickerTab,
    setActiveTab: Dispatch<SetStateAction<ColorPickerTab>>,
    onChange: TFunc<[TColorPickerValue]>,
    value: TColorPickerValue,
    gradientPanel: TUseGradientPanelResult,
    patternPanel: TUsePatternPanelResult,
    onGradientChange?: TFunc<[TGradientPanelChange]>,
    onPatternChange?: TFunc<[TPatternPanelChange]>,
    onImageChange?: TFunc<[TImagePanelChange]>,
    onVideoChange?: TFunc<[TVideoPanelChange]>,
  ): TFunc<[TTab['name']]> =>
  (tabName) => {
    if (isColorPickerTab(tabName)) {
      setActiveTab(tabName);

      if (tabName !== activeTab) {
        switch (tabName) {
          case ColorPickerTab.gradient:
            onGradientChange?.({ angle: gradientPanel.angle, stops: gradientPanel.stops, type: gradientPanel.type });
            patternPanel.reset();
            break;
          case ColorPickerTab.pattern:
            onPatternChange?.({
              alignmentIndex: patternPanel.alignmentIndex,
              direction: patternPanel.direction,
              offsetX: patternPanel.offsetX,
              offsetY: patternPanel.offsetY,
              scale: patternPanel.scale,
              spacingX: patternPanel.spacingX,
              spacingY: patternPanel.spacingY,
              tileType: patternPanel.tileType,
            });
            gradientPanel.reset();
            break;
          case ColorPickerTab.image:
            onImageChange?.({ ref: '', scaleMode: 'fill' });
            gradientPanel.reset();
            patternPanel.reset();
            break;
          case ColorPickerTab.video:
            onVideoChange?.({ ref: '', scaleMode: 'fill' });
            gradientPanel.reset();
            patternPanel.reset();
            break;
          default:
            onChange(value);
            gradientPanel.reset();
            patternPanel.reset();
        }
      }
    }
  };
