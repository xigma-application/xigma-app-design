// types
import { ColorPickerTab } from '../enums';
import { TSolidPanelProps } from './SolidPanel/SolidPanel';
import { TUseGradientPanelResult } from './GradientPanel/hooks/useGradientPanel/useGradientPanel';
import { TImageAdjustments } from 'types/design/paint/types';
import { TImageFillMode } from './ImagePanel/types';
import { TUseImagePanelResult } from './ImagePanel/hooks/useImagePanel';
import { TUsePatternPanelResult } from './PatternPanel/hooks/usePatternPanel';
import { TUsePatternSourcePickingResult } from '../hooks/usePatternSourcePicking';

export type TBodyProps = TSolidPanelProps & {
  activeTab: ColorPickerTab;
  gradientPanel: TUseGradientPanelResult;
  imageAdjustments?: TImageAdjustments;
  imagePanel: TUseImagePanelResult;
  imageTileScale?: number;
  onImageAdjustmentChange?: TFunc<[keyof TImageAdjustments, number]>;
  onImageRotate?: TFunc;
  onImageScaleModeChange?: TFunc<[TImageFillMode]>;
  onImageTileScaleChange?: TFunc<[number]>;
  patternPanel: TUsePatternPanelResult;
  patternSourceNodeId?: string | null;
  patternSourcePicking: TUsePatternSourcePickingResult;
};
