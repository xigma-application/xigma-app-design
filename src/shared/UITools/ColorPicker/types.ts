import { CSSProperties, ReactNode } from 'react';

// components
import { TPopoverProps } from 'shared/UITools/Popover/Popover';

// types
import { TGradientPanelChange } from './Body/GradientPanel/types';

export type TColorPickerValue = { alpha: number; hex: string };

export type THsv = { h: number; s: number; v: number };
export type THsl = { h: number; l: number; s: number };

export type TColorPickerPreview = { style: CSSProperties; type: 'gradient' } | { type: 'solid'; value: TColorPickerValue };

export type TColorPickerProps = {
  align?: TPopoverProps['align'];
  avoidCollisions?: TPopoverProps['avoidCollisions'];
  className?: string;
  freezePositionOnGrow?: TPopoverProps['freezePositionOnGrow'];
  headerExtra?: ReactNode;
  moveable?: boolean;
  onChange: TFunc<[TColorPickerValue]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  onGradientChange?: TFunc<[TGradientPanelChange]>;
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
