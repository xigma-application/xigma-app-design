import { TIconProps } from '@xigma/components';

export type TDropdownOption<TValue extends string> = {
  icon?: TIconProps['name'];
  iconSize?: number;
  label: string;
  triggerLabel?: string;
  value: TValue;
};

export type TDropdownVariant = 'filled' | 'outline';
