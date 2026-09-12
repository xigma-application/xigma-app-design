// types
import { FocusEvent } from 'react';

export type TUseCornerSmoothingPopoverResult = {
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onSliderChange: TFunc<[number]>;
  value: number;
};
