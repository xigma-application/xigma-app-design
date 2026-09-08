// others
import { AUTO_LAYOUT_PADDING_ZERO_HANDLE_REACH_PX } from 'constant/canvas';

// types
import { TAutoLayoutPaddingSide } from 'utils/canvas/autoLayoutPadding/types';
import { TFrameNode, TViewport } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getAutoLayoutPaddingHandles } from 'utils/canvas/autoLayoutPadding/getAutoLayoutPaddingHandles';
import { isAutoLayoutPaddingHandleHit } from 'utils/canvas/autoLayoutPadding/isAutoLayoutPaddingHandleHit';

export type TAutoLayoutPaddingHit = {
  side: TAutoLayoutPaddingSide;
  value: number;
};

const SIDES: TAutoLayoutPaddingSide[] = ['left', 'right', 'top', 'bottom'];

export const getAutoLayoutPaddingHandleAtPoint = (
  localPoint: TPoint,
  frame: TFrameNode,
  viewport: TViewport,
  toleranceWorldUnits: number,
): TAutoLayoutPaddingHit | null => {
  const handles = getAutoLayoutPaddingHandles(frame, viewport, null);
  const reachWorldUnits = AUTO_LAYOUT_PADDING_ZERO_HANDLE_REACH_PX / viewport.zoom;
  const hitSide = SIDES.find((side) =>
    isAutoLayoutPaddingHandleHit(side, localPoint, frame, handles[side], toleranceWorldUnits, reachWorldUnits),
  );

  return hitSide ? { side: hitSide, value: handles[hitSide].value } : null;
};
