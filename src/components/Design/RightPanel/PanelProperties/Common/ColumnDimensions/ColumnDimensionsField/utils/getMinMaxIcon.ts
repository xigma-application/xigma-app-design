// @xigma
import { TIconProps } from '@xigma/components';

export const getMinMaxIcon = (isWidth: boolean, hasMin: boolean, hasMax: boolean): TIconProps['name'] | undefined => {
  if (hasMin || hasMax) {
    return isWidth ? 'WidthRestricted' : 'HeightRestricted';
  }

  return undefined;
};
