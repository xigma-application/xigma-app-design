// types
import { LayoutGuideColumnsAlign } from 'types/design/enums';
import { TDrawableRect } from '../drawRect/drawRect';
import { TFrameNode, TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideColumnsAlign } from 'utils/design/layoutGuides/getLayoutGuideColumnsAlign';
import { getLayoutGuideFieldValue } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';

const getColumnsStartX = (align: LayoutGuideColumnsAlign, frameWidth: number, margin: number, totalWidth: number): number => {
  switch (align) {
    case LayoutGuideColumnsAlign.right:
      return frameWidth - margin - totalWidth;
    case LayoutGuideColumnsAlign.center:
      return (frameWidth - totalWidth) / 2;
    default:
      return margin;
  }
};

export const getLayoutGuideColumnsRects = (guide: TLayoutGuide, frame: TFrameNode): TDrawableRect[] => {
  const align = getLayoutGuideColumnsAlign(guide);
  const count = getLayoutGuideFieldValue(guide, 'count');
  const gutter = getLayoutGuideFieldValue(guide, 'gutter');
  const margin = getLayoutGuideFieldValue(guide, 'margin');
  const available = frame.width - margin * 2;
  const columnWidth =
    align === LayoutGuideColumnsAlign.stretch ? (available - gutter * (count - 1)) / count : getLayoutGuideFieldValue(guide, 'width');
  const totalWidth = columnWidth * count + gutter * (count - 1);
  const startX = getColumnsStartX(align, frame.width, margin, totalWidth);

  return Array.from({ length: count }, (_column, index) => ({
    fill: guide.color,
    fillAlpha: guide.opacity / 100,
    height: frame.height,
    width: columnWidth,
    x: frame.x + startX + index * (columnWidth + gutter),
    y: frame.y,
  }));
};
