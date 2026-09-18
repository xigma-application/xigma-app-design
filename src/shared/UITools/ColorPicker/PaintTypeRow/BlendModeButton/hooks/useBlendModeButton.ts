import { useState } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

// types
import { BlendMode } from 'types/design/enums';

export type TUseBlendModeButtonResult = {
  icon: TIconProps['name'];
  onOpenChange: TFunc<[boolean]>;
  open: boolean;
  selectBlendMode: (blendMode: BlendMode) => TFunc;
};

export const useBlendModeButton = (value: BlendMode, onChange?: TFunc<[BlendMode]>): TUseBlendModeButtonResult => {
  const [open, setOpen] = useState(false);
  const isDefault = value === BlendMode.normal;

  return {
    icon: isDefault ? 'DropEmpty' : 'DropFilled',
    onOpenChange: setOpen,
    open,
    selectBlendMode: (blendMode: BlendMode) => (): void => {
      onChange?.(blendMode);
    },
  };
};
