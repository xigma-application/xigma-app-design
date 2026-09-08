// others
import { AUTO_LAYOUT_PADDING_ZERO_HANDLE_OUTSET_PX } from 'constant/canvas';

// store
import { getFramePadding } from 'store/design/utils/autoLayout/getFramePadding';

// types
import { TAutoLayoutPaddingHandle, TAutoLayoutPaddingHandles, TAutoLayoutPaddingSide } from './types';
import { TFrameNode, TViewport } from 'types/design/types';

// utils
import { getAutoLayoutPaddingBand } from './getAutoLayoutPaddingBand';
import { getAutoLayoutPaddingHandleCenter } from './getAutoLayoutPaddingHandleCenter';
import { getAutoLayoutPaddingHandleInset } from './getAutoLayoutPaddingHandleInset';
import { getAutoLayoutPaddingMaxInset } from './getAutoLayoutPaddingMaxInset';

export const getAutoLayoutPaddingHandles = (
  frame: TFrameNode,
  viewport: TViewport,
  draggingSide: TAutoLayoutPaddingSide | null,
): TAutoLayoutPaddingHandles => {
  const padding = getFramePadding(frame);
  const zeroStateOffset = -AUTO_LAYOUT_PADDING_ZERO_HANDLE_OUTSET_PX / viewport.zoom;

  const buildHandle = (side: TAutoLayoutPaddingSide, value: number): TAutoLayoutPaddingHandle => {
    const band = getAutoLayoutPaddingBand(frame, padding, side);
    const maxInset = getAutoLayoutPaddingMaxInset(frame, side);
    const inset = getAutoLayoutPaddingHandleInset(value, maxInset, zeroStateOffset, side === draggingSide);

    return { band, handleCenter: getAutoLayoutPaddingHandleCenter(frame, side, inset), side, value };
  };

  return {
    bottom: buildHandle('bottom', padding.paddingBottom),
    left: buildHandle('left', padding.paddingLeft),
    right: buildHandle('right', padding.paddingRight),
    top: buildHandle('top', padding.paddingTop),
  };
};
