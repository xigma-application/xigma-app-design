// hooks
import { useSetGradientPaint } from './useSetGradientPaint/useSetGradientPaint';
import { useSetPaint } from './useSetPaint';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { DEFAULT_VECTOR_PAINT } from 'store/design/constants';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectPaint } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';
import { TGradientPanelChange } from 'shared/UITools/ColorPicker/Body/GradientPanel/types';

export type TUsePaintColorPickerValueResult = {
  onChange: TFunc<[TColorPickerValue]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onGradientChange: TFunc<[TGradientPanelChange]>;
  value: TColorPickerValue;
};

export const usePaintColorPickerValue = (): TUsePaintColorPickerValueResult => {
  const paint = useAppSelector(selectPaint);
  const setPaint = useSetPaint();
  const setGradientPaint = useSetGradientPaint();
  const dispatch = useAppDispatch();
  const solidPaint = paint.type === 'solid' ? paint : DEFAULT_VECTOR_PAINT;

  return {
    onChange: setPaint,
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onGradientChange: setGradientPaint,
    value: { alpha: solidPaint.opacity, hex: solidPaint.color },
  };
};
