import { CSSProperties, ReactNode } from 'react';

// components
import { TPopoverProps } from 'shared/UITools/Popover/Popover';

// types
import { ColorPickerTab } from './enums';
import { TGradientPanelChange, TInitialGradient } from './Body/GradientPanel/types';
import { TImageAdjustments } from 'types/design/paint/types';
import { TImageFillMode, TImagePanelChange } from './Body/ImagePanel/types';
import { TInitialPattern, TPatternPanelChange } from './Body/PatternPanel/types';

export type TColorPickerValue = { alpha: number; hex: string };

export type THsv = { h: number; s: number; v: number };
export type THsl = { h: number; l: number; s: number };

export type TColorPickerPreview = { style: CSSProperties; type: 'gradient' } | { type: 'solid'; value: TColorPickerValue };

export type TGradientPanelState = { isGradientTabActive: boolean; selectedStopIndex: number | null };

export type TColorPickerProps = {
  align?: TPopoverProps['align'];
  avoidCollisions?: TPopoverProps['avoidCollisions'];
  className?: string;
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
  isPointerOverGradientHandle?: TFunc<[], boolean>;
  moveable?: boolean;
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
};
