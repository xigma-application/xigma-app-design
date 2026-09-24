// types
import { FocusEvent } from 'react';

export type TUseCornerSmoothingPopoverResult = {
  displayValue: string;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onSliderChange: TFunc<[number]>;
  value: number;
};
