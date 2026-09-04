// hooks
import { useSetPaint } from './useSetPaint';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectPaint } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';

export type TUsePaintColorPickerValueResult = {
  onChange: TFunc<[TColorPickerValue]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  value: TColorPickerValue;
};

export const usePaintColorPickerValue = (): TUsePaintColorPickerValueResult => {
  const paint = useAppSelector(selectPaint);
  const setPaint = useSetPaint();
  const dispatch = useAppDispatch();

  return {
    onChange: setPaint,
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    value: { alpha: paint.opacity, hex: paint.color },
  };
};
