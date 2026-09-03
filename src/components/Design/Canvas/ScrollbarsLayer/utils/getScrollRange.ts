// others
import { SCROLLBAR_RANGE_PADDING_PX } from '../../constants';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

const unionRect = (a: TDraftRect, b: TDraftRect): TDraftRect => {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);

  return { height: Math.max(a.y + a.height, b.y + b.height) - y, width: Math.max(a.x + a.width, b.x + b.width) - x, x, y };
};

export const getScrollRange = (contentBoundsWorld: TDraftRect, viewport: TViewport, visibleRect: TDraftRect): TDraftRect => {
  const contentScreen: TDraftRect = {
    height: contentBoundsWorld.height * viewport.zoom,
    width: contentBoundsWorld.width * viewport.zoom,
    x: contentBoundsWorld.x * viewport.zoom + viewport.x,
    y: contentBoundsWorld.y * viewport.zoom + viewport.y,
  };
  const range = unionRect(contentScreen, visibleRect);

  return {
    height: range.height + SCROLLBAR_RANGE_PADDING_PX * 2,
    width: range.width + SCROLLBAR_RANGE_PADDING_PX * 2,
    x: range.x - SCROLLBAR_RANGE_PADDING_PX,
    y: range.y - SCROLLBAR_RANGE_PADDING_PX,
  };
};
