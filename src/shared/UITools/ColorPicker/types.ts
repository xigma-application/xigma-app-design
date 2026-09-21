import { CSSProperties, ReactNode } from 'react';

// components
import { TPopoverProps } from 'shared/UITools/Popover/Popover';

// types
import { BlendMode } from 'types/design/enums';
import { ColorPickerTab } from './enums';
import { TContrastUnsupportedReason } from './Body/SolidPanel/ContrastChecker/types';
import { TGradientPanelChange, TInitialGradient } from './Body/GradientPanel/types';
import { TImageAdjustments } from 'types/design/paint/types';
import { TImageFillMode, TImagePanelChange } from './Body/ImagePanel/types';
import { TInitialPattern, TPatternPanelChange } from './Body/PatternPanel/types';
import { TVideoPanelChange } from './Body/VideoPanel/types';

export type TColorPickerValue = { alpha: number; hex: string };

export type THsv = { h: number; s: number; v: number };
export type THsl = { h: number; l: number; s: number };

export type TColorPickerPreview = { style: CSSProperties; type: 'gradient' } | { type: 'solid'; value: TColorPickerValue };

export type TGradientPanelState = { isGradientTabActive: boolean; selectedStopIndex: number | null };

export type TColorPickerProps = {
  align?: TPopoverProps['align'];
  availableTabs?: ColorPickerTab[];
  avoidCollisions?: TPopoverProps['avoidCollisions'];
  blendMode?: BlendMode;
  className?: string;
  contrastBackgroundColor?: string;
  contrastUnsupportedReason?: TContrastUnsupportedReason;
  freezePositionOnGrow?: TPopoverProps['freezePositionOnGrow'];
  headerExtra?: ReactNode;
  imageAdjustments?: TImageAdjustments;
  imageTileScale?: number;
  initialActiveTab?: ColorPickerTab;
  initialFillMode?: TImageFillMode;
  initialGradient?: TInitialGradient;
  initialImageUrl?: string;
  initialOpen?: boolean;
  initialPattern?: TInitialPattern;
  initialVideoUrl?: string;
  isPointerOverGradientHandle?: TFunc<[], boolean>;
  moveable?: boolean;
  onBlendModeChange?: TFunc<[BlendMode]>;
  onChange: TFunc<[TColorPickerValue]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  onGradientChange?: TFunc<[TGradientPanelChange]>;
  onGradientPanelStateChange?: TFunc<[TGradientPanelState]>;
  onImageAdjustmentChange?: TFunc<[keyof TImageAdjustments, number]>;
  onImageChange?: TFunc<[TImagePanelChange]>;
  onImageRotate?: TFunc;
  onImageScaleModeChange?: TFunc<[TImageFillMode]>;
  onImageTabActiveChange?: TFunc<[boolean]>;
  onImageTileScaleChange?: TFunc<[number]>;
  onImageUrlChange?: TFunc<[string | null]>;
  onOpenChange?: TFunc<[boolean]>;
  onPatternChange?: TFunc<[TPatternPanelChange]>;
  onVideoChange?: TFunc<[TVideoPanelChange]>;
  onVideoRotate?: TFunc;
  onVideoScaleModeChange?: TFunc<[TImageFillMode]>;
  onVideoTabActiveChange?: TFunc<[boolean]>;
  onVideoTileScaleChange?: TFunc<[number]>;
  onVideoUrlChange?: TFunc<[string | null]>;
  paintTypeRow?: boolean;
  patternSourceNodeId?: string | null;
  presets?: TColorPickerValue[];
  side?: TPopoverProps['side'];
  sideOffset?: number;
  simple?: boolean;
  title?: string;
  trigger: ReactNode | ((preview: TColorPickerPreview) => ReactNode);
  triggerAriaLabel?: string;
  triggerClassName?: string;
  value: TColorPickerValue;
  videoTileScale?: number;
};
