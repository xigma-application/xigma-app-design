import { ReactNode } from 'react';

// components
import { TPopoverProps } from 'shared/UITools/Popover/Popover';

export type TColorPickerValue = { alpha: number; hex: string };

export type THsv = { h: number; s: number; v: number };
export type THsl = { h: number; l: number; s: number };

export type TColorPickerProps = {
  align?: TPopoverProps['align'];
  className?: string;
  moveable?: boolean;
  onChange: TFunc<[TColorPickerValue]>;
  onOpenChange?: TFunc<[boolean]>;
  presets?: TColorPickerValue[];
  side?: TPopoverProps['side'];
  sideOffset?: number;
  trigger: ReactNode;
  triggerAriaLabel?: string;
  triggerClassName?: string;
  value: TColorPickerValue;
};
