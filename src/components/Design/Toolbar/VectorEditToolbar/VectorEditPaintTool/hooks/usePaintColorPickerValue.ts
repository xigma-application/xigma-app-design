// hooks
import { useSetPaint } from './useSetPaint';

// store
import { selectPaint } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';

export type TUsePaintColorPickerValueResult = {
  onChange: TFunc<[TColorPickerValue]>;
  value: TColorPickerValue;
};

export const usePaintColorPickerValue = (): TUsePaintColorPickerValueResult => {
  const paint = useAppSelector(selectPaint);
  const setPaint = useSetPaint();

  return { onChange: setPaint, value: { alpha: paint.opacity, hex: paint.color } };
};
