import { useEffect } from 'react';

// types
import { ColorPickerTab } from '../enums';
import { TGradientPanelState } from '../types';
import { TUseGradientPanelResult } from '../Body/GradientPanel/hooks/useGradientPanel/useGradientPanel';

export const useNotifyGradientPanelState = (
  activeTab: ColorPickerTab,
  gradientPanel: TUseGradientPanelResult,
  onGradientPanelStateChange?: TFunc<[TGradientPanelState]>,
): void => {
  useEffect(() => {
    const selectedStopIndex = gradientPanel.stops.findIndex((stop) => stop.id === gradientPanel.selectedStopId);

    onGradientPanelStateChange?.({
      isGradientTabActive: activeTab === ColorPickerTab.gradient,
      selectedStopIndex: selectedStopIndex === -1 ? null : selectedStopIndex,
    });
  }, [activeTab, gradientPanel.selectedStopId, gradientPanel.stops, onGradientPanelStateChange]);
};
