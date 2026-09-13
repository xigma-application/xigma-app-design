// types
import { ColorPickerTab } from '../enums';
import { TSolidPanelProps } from './SolidPanel/SolidPanel';
import { TUseGradientPanelResult } from './GradientPanel/hooks/useGradientPanel';

export type TBodyProps = TSolidPanelProps & { activeTab: ColorPickerTab; gradientPanel: TUseGradientPanelResult };
