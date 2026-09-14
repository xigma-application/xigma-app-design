import { CSSProperties, ReactNode } from 'react';

// components
import { TPopoverProps } from 'shared/UITools/Popover/Popover';

// types
import { ColorPickerTab } from './enums';
import { TGradientPanelChange, TInitialGradient } from './Body/GradientPanel/types';

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
  historyRevision?: number;
  initialActiveTab?: ColorPickerTab;
  initialGradient?: TInitialGradient;
  isPointerOverGradientHandle?: TFunc<[], boolean>;
  moveable?: boolean;
  onChange: TFunc<[TColorPickerValue]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  onGradientChange?: TFunc<[TGradientPanelChange]>;
  onGradientPanelStateChange?: TFunc<[TGradientPanelState]>;
  onOpenChange?: TFunc<[boolean]>;
  paintTypeRow?: boolean;
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
