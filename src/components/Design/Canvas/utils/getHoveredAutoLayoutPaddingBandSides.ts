// store
import { getFramePadding } from 'store/design/utils/autoLayout/getFramePadding';

// types
import { TAutoLayoutPaddingSide } from 'utils/canvas/autoLayoutPadding/types';
import { TFrameNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getAutoLayoutPaddingBand } from 'utils/canvas/autoLayoutPadding/getAutoLayoutPaddingBand';
import { getAutoLayoutPaddingKey } from 'utils/canvas/autoLayoutPadding/getAutoLayoutPaddingKey';
import { isPointInRect } from './isPointInRect';

const SIDES: TAutoLayoutPaddingSide[] = ['left', 'right', 'top', 'bottom'];

export const getHoveredAutoLayoutPaddingBandSides = (localPoint: TPoint, frame: TFrameNode): TAutoLayoutPaddingSide[] => {
  const padding = getFramePadding(frame);

  return SIDES.filter(
    (side) => padding[getAutoLayoutPaddingKey(side)] > 0 && isPointInRect(localPoint, getAutoLayoutPaddingBand(frame, padding, side)),
  );
};
