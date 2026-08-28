import { useState } from 'react';

// hooks
import { useSetPaintColor } from './useSetPaintColor';

// store
import { selectPaintColor } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';

const DEFAULT_PAINT_ALPHA = 100;

export type TUsePaintColorPickerValueResult = {
  onChange: TFunc<[TColorPickerValue]>;
  value: TColorPickerValue;
};

export const usePaintColorPickerValue = (): TUsePaintColorPickerValueResult => {
  const hex = useAppSelector(selectPaintColor);
  const setPaintColor = useSetPaintColor();
  const [alpha, setAlpha] = useState(DEFAULT_PAINT_ALPHA);

  const onChange = (next: TColorPickerValue): void => {
    setAlpha(next.alpha);
    setPaintColor(next);
  };

  return { onChange, value: { alpha, hex } };
};
