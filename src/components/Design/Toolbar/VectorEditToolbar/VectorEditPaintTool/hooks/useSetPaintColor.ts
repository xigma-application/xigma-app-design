// store
import { setPaintColor } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';

export const useSetPaintColor = (): TFunc<[TColorPickerValue]> => {
  const dispatch = useAppDispatch();

  return (value: TColorPickerValue): void => {
    dispatch(setPaintColor(value.hex));
  };
};
