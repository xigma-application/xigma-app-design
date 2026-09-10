import { FocusEvent } from 'react';

// types
import { SizingMode } from 'types/design/enums';

export const getValueBlurHandlerByMode = (
  handleFillBlur: TFunc<[FocusEvent<HTMLInputElement>]>,
  handleBlur: TFunc<[FocusEvent<HTMLInputElement>]>,
  handleHugBlur: TFunc<[FocusEvent<HTMLInputElement>]>,
): Record<SizingMode, TFunc<[FocusEvent<HTMLInputElement>]>> => ({
  [SizingMode.fill]: handleFillBlur,
  [SizingMode.fixed]: handleBlur,
  [SizingMode.hug]: handleHugBlur,
});
