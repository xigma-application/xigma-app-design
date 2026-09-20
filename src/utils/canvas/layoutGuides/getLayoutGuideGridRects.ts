// types
import { TDrawableRect } from '../drawRect/drawRect';
import { TFrameNode, TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideFieldValue } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';

export const getLayoutGuideGridRects = (guide: TLayoutGuide, frame: TFrameNode, lineWidth: number): TDrawableRect[] => {
  const size = getLayoutGuideFieldValue(guide, 'size');
  const fill = guide.color;
  const fillAlpha = guide.opacity / 100;
  const rects: TDrawableRect[] = [];

  for (let x = 0; x <= frame.width; x += size) {
    rects.push({ fill, fillAlpha, height: frame.height, width: lineWidth, x: frame.x + x - lineWidth / 2, y: frame.y });
  }

  for (let y = 0; y <= frame.height; y += size) {
    rects.push({ fill, fillAlpha, height: lineWidth, width: frame.width, x: frame.x, y: frame.y + y - lineWidth / 2 });
  }

  return rects;
};
