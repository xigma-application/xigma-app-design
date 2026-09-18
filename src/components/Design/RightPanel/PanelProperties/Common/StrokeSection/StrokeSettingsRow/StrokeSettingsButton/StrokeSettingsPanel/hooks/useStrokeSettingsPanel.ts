import { useState } from 'react';

// types
import { StrokeSettingsTab } from '../enums';

export type TUseStrokeSettingsPanelResult = {
  activeTab: StrokeSettingsTab;
  onTabChange: TFunc<[string]>;
};

export const useStrokeSettingsPanel = (): TUseStrokeSettingsPanelResult => {
  const [activeTab, setActiveTab] = useState(StrokeSettingsTab.basic);

  return {
    activeTab,
    onTabChange: (tab: string): void => setActiveTab(tab as StrokeSettingsTab),
  };
};
