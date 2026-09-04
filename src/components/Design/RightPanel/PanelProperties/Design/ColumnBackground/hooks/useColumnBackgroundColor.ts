// store
import { selectPaint } from 'store/design/selectors';
import { setPaint } from 'store/design/slice';
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
  onPickerChange: TFunc<[TColorPickerValue]>;
  onToggleVisibility: TFunc;
};

export const useColumnBackgroundColor = (): TUseColumnBackgroundColorResult => {
  const paint = useAppSelector(selectPaint);
  const dispatch = useAppDispatch();

  const apply = (patch: Partial<TSolidPaint>): void => {
    dispatch(setPaint({ ...paint, ...patch }));
  };

  return {
    alpha: paint.opacity,
    hex: paint.color,
    isVisible: paint.visible !== false,
    onCommitAlpha: (opacity) => apply({ opacity }),
    onCommitHex: (color) => apply({ color }),
    onPickerChange: ({ alpha, hex }) => apply({ color: hex, opacity: alpha }),
    onToggleVisibility: () => apply({ visible: paint.visible === false }),
  };
};
