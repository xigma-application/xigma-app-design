// store
import { TAutoLayoutPadding } from 'store/design/utils/autoLayout/getAutoLayoutContentBox';

// types
import { TAutoLayoutPaddingSide } from './types';
import { TDraftRect } from 'types/canvas';

const BAND_BY_SIDE: Record<TAutoLayoutPaddingSide, (frame: TDraftRect, padding: TAutoLayoutPadding) => TDraftRect> = {
  bottom: (frame, padding) => ({
    height: padding.paddingBottom,
    width: frame.width,
    x: frame.x,
    y: frame.y + frame.height - padding.paddingBottom,
  }),
  left: (frame, padding) => ({ height: frame.height, width: padding.paddingLeft, x: frame.x, y: frame.y }),
  right: (frame, padding) => ({
    height: frame.height,
    width: padding.paddingRight,
    x: frame.x + frame.width - padding.paddingRight,
    y: frame.y,
  }),
  top: (frame, padding) => ({ height: padding.paddingTop, width: frame.width, x: frame.x, y: frame.y }),
};

export const getAutoLayoutPaddingBand = (frame: TDraftRect, padding: TAutoLayoutPadding, side: TAutoLayoutPaddingSide): TDraftRect =>
  BAND_BY_SIDE[side](frame, padding);
