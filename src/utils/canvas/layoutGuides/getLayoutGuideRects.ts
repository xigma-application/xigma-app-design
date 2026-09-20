// types
import { LayoutGuideType } from 'types/design/enums';
import { TDrawableRect } from '../drawRect/drawRect';
import { TFrameNode, TLayoutGuide } from 'types/design/types';

// utils
import { clampRectToFrameBounds } from './clampRectToFrameBounds';
import { getLayoutGuideColumnsRects } from './getLayoutGuideColumnsRects';
import { getLayoutGuideGridRects } from './getLayoutGuideGridRects';
import { getLayoutGuideRowsRects } from './getLayoutGuideRowsRects';

const getRawLayoutGuideRects = (guide: TLayoutGuide, frame: TFrameNode, lineWidth: number): TDrawableRect[] => {
  switch (guide.type) {
    case LayoutGuideType.columns:
      return getLayoutGuideColumnsRects(guide, frame);
    case LayoutGuideType.rows:
      return getLayoutGuideRowsRects(guide, frame);
    default:
      return getLayoutGuideGridRects(guide, frame, lineWidth);
  }
};

export const getLayoutGuideRects = (guide: TLayoutGuide, frame: TFrameNode, lineWidth: number): TDrawableRect[] =>
  getRawLayoutGuideRects(guide, frame, lineWidth)
    .map((rect) => clampRectToFrameBounds(rect, frame))
    .filter((rect) => rect.width > 0 && rect.height > 0);
