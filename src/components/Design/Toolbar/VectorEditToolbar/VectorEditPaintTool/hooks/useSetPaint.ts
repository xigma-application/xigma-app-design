// store
import { selectPaint } from 'store/design/selectors';
import { setPaint } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';

export const useSetPaint = (): TFunc<[TColorPickerValue]> => {
  const dispatch = useAppDispatch();
  const paint = useAppSelector(selectPaint);

  return (value: TColorPickerValue): void => {
    dispatch(setPaint({ blendMode: paint.blendMode, color: value.hex, opacity: value.alpha, type: 'solid' }));
  };
};
