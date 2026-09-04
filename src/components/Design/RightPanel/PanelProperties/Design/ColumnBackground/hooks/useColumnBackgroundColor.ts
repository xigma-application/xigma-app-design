// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectBackgroundPaint } from 'store/design/selectors';
import { setBackgroundPaint } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';
import { TSolidPaint } from 'types/design/paint/types';

export type TUseColumnBackgroundColorResult = {
  alpha: number;
  hex: string;
  isVisible: boolean;
  onCommitAlpha: TFunc<[number]>;
  onCommitHex: TFunc<[string]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onPickerChange: TFunc<[TColorPickerValue]>;
  onToggleVisibility: TFunc;
};

export const useColumnBackgroundColor = (): TUseColumnBackgroundColorResult => {
  const paint = useAppSelector(selectBackgroundPaint);
  const dispatch = useAppDispatch();

  const apply = (patch: Partial<TSolidPaint>): void => {
    dispatch(setBackgroundPaint({ ...paint, ...patch }));
  };

  return {
    alpha: paint.opacity,
    hex: paint.color,
    isVisible: paint.visible !== false,
    onCommitAlpha: (opacity) => apply({ opacity }),
    onCommitHex: (color) => apply({ color }),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onPickerChange: ({ alpha, hex }) => apply({ color: hex, opacity: alpha }),
    onToggleVisibility: () => apply({ visible: paint.visible === false }),
  };
};
