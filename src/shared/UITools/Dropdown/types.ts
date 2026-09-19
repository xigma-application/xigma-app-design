import { ReactNode } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

export type TDropdownOption<TValue extends string> = {
  content?: ReactNode;
  icon?: TIconProps['name'];
  iconSize?: number;
  label: string;
  separatorBefore?: boolean;
  triggerLabel?: string;
  value: TValue;
};

export type TDropdownSize = 'default' | 'large';

export type TDropdownVariant = 'filled' | 'outline';
