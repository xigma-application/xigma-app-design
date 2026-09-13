import { useState } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

// store
import { selectPaint } from 'store/design/selectors';
import { setPaintBlendMode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { BlendMode } from 'types/design/enums';

export type TUseFaceBlendModeButtonResult = {
  icon: TIconProps['name'];
  isDefault: boolean;
  onOpenChange: TFunc<[boolean]>;
  open: boolean;
  selectBlendMode: (blendMode: BlendMode) => TFunc;
  value: BlendMode;
};

export const useFaceBlendModeButton = (): TUseFaceBlendModeButtonResult => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const paint = useAppSelector(selectPaint);
  const value = paint.blendMode ?? BlendMode.normal;
  const isDefault = value === BlendMode.normal;

  return {
    icon: isDefault ? 'DropEmpty' : 'DropFilled',
    isDefault,
    onOpenChange: setOpen,
    open,
    selectBlendMode: (blendMode: BlendMode) => (): void => {
      dispatch(setPaintBlendMode(blendMode));
    },
    value,
  };
};
