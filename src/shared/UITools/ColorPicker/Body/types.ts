// types
import { ColorPickerTab } from '../enums';
import { TSolidPanelProps } from './SolidPanel/SolidPanel';
import { TUseGradientPanelResult } from './GradientPanel/hooks/useGradientPanel/useGradientPanel';
import { TUsePatternPanelResult } from './PatternPanel/hooks/usePatternPanel';

export type TBodyProps = TSolidPanelProps & {
  activeTab: ColorPickerTab;
  gradientPanel: TUseGradientPanelResult;
  patternPanel: TUsePatternPanelResult;
};
