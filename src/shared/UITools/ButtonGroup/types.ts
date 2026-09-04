import { ReactNode } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

export type TButtonGroup = {
  ariaLabel?: string;
  disabled?: boolean;
  name: TIconProps['name'];
  onClick: TFunc;
  tooltip?: ReactNode;
};
