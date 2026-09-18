// others
import { STROKE_SETTINGS_TABS } from '../constants';

// types
import { StrokeSettingsTab } from '../enums';
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export const getStrokeSettingsTabButtons = (getLabel: (tab: StrokeSettingsTab) => string): TToggleButton[] =>
  STROKE_SETTINGS_TABS.map((tab) => ({ ariaLabel: getLabel(tab), label: getLabel(tab), tooltip: getLabel(tab), value: tab }));
