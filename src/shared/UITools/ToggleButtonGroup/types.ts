import { ReactNode } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

export type TToggleButton = {
  ariaLabel?: string;
  icon?: TIconProps['name'];
  iconFlipped?: boolean;
  label?: ReactNode;
  tooltip?: ReactNode;
  value: string;
};
