import { ReactNode } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

export type TButtonGroup = {
  active?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  name: TIconProps['name'];
  onClick: TFunc;
  tooltip?: ReactNode;
};
