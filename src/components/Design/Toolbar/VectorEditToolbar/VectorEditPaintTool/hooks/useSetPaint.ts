// store
import { setPaint } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';

export const useSetPaint = (): TFunc<[TColorPickerValue]> => {
  const dispatch = useAppDispatch();

  return (value: TColorPickerValue): void => {
    dispatch(setPaint({ color: value.hex, opacity: value.alpha, type: 'solid' }));
  };
};
