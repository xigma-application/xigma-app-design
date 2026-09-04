// @xigma
import { TIconProps } from '@xigma/components';

// types
import { LayoutMode } from 'types/design/enums';

export type TFlowOption = {
  icon: TIconProps['name'];
  labelKey: string;
  value: LayoutMode;
};
