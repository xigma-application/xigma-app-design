// types
import { TAutoLayoutPaddingSide } from 'utils/canvas/autoLayoutPadding/types';
import { TIconProps } from 'shared';

const ICON_NAME_BY_SIDE: Record<TAutoLayoutPaddingSide, TIconProps['name']> = {
  bottom: 'PaddingB',
  left: 'PaddingL',
  right: 'PaddingR',
  top: 'PaddingT',
};

export const getAutoLayoutPaddingIconName = (side: TAutoLayoutPaddingSide): TIconProps['name'] => ICON_NAME_BY_SIDE[side];
