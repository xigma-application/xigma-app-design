import { ReactNode } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

export type TToggleButton = {
  ariaLabel?: string;
  icon: TIconProps['name'];
  tooltip?: ReactNode;
  value: string;
};
