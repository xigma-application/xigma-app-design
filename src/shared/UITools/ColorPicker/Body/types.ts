// types
import { ColorPickerTab } from '../enums';
import { TSolidPanelProps } from './SolidPanel/SolidPanel';
import { TUseGradientPanelResult } from './GradientPanel/hooks/useGradientPanel/useGradientPanel';
import { TUsePatternPanelResult } from './PatternPanel/hooks/usePatternPanel';
import { TUsePatternSourcePickingResult } from '../hooks/usePatternSourcePicking';

export type TBodyProps = TSolidPanelProps & {
  activeTab: ColorPickerTab;
  gradientPanel: TUseGradientPanelResult;
  patternPanel: TUsePatternPanelResult;
  patternSourceNodeId?: string | null;
  patternSourcePicking: TUsePatternSourcePickingResult;
};
