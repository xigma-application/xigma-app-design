// types
import { ColorPickerTab } from '../enums';
import { TSolidPanelProps } from './SolidPanel/SolidPanel';
import { TUseGradientPanelResult } from './GradientPanel/hooks/useGradientPanel/useGradientPanel';
import { TImageFillMode } from './ImagePanel/types';
import { TUseImagePanelResult } from './ImagePanel/hooks/useImagePanel';
import { TUsePatternPanelResult } from './PatternPanel/hooks/usePatternPanel';
import { TUsePatternSourcePickingResult } from '../hooks/usePatternSourcePicking';

export type TBodyProps = TSolidPanelProps & {
  activeTab: ColorPickerTab;
  gradientPanel: TUseGradientPanelResult;
  imagePanel: TUseImagePanelResult;
  imageTileScale?: number;
  onImageRotate?: TFunc;
  onImageScaleModeChange?: TFunc<[TImageFillMode]>;
  onImageTileScaleChange?: TFunc<[number]>;
  patternPanel: TUsePatternPanelResult;
  patternSourceNodeId?: string | null;
  patternSourcePicking: TUsePatternSourcePickingResult;
};
