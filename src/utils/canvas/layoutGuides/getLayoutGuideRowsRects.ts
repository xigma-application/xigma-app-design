// types
import { LayoutGuideRowsAlign } from 'types/design/enums';
import { TDrawableRect } from '../drawRect/drawRect';
import { TFrameNode, TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideFieldValue } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';
import { getLayoutGuideRowsAlign } from 'utils/design/layoutGuides/getLayoutGuideRowsAlign';

const getRowsStartY = (align: LayoutGuideRowsAlign, frameHeight: number, margin: number, totalHeight: number): number => {
  switch (align) {
    case LayoutGuideRowsAlign.bottom:
      return frameHeight - margin - totalHeight;
    case LayoutGuideRowsAlign.center:
      return (frameHeight - totalHeight) / 2;
    default:
      return margin;
  }
};

export const getLayoutGuideRowsRects = (guide: TLayoutGuide, frame: TFrameNode): TDrawableRect[] => {
  const align = getLayoutGuideRowsAlign(guide);
  const count = getLayoutGuideFieldValue(guide, 'count');
  const gutter = getLayoutGuideFieldValue(guide, 'gutter');
  const margin = getLayoutGuideFieldValue(guide, 'margin');
  const available = frame.height - margin * 2;
  const rowHeight =
    align === LayoutGuideRowsAlign.stretch ? (available - gutter * (count - 1)) / count : getLayoutGuideFieldValue(guide, 'height');
  const totalHeight = rowHeight * count + gutter * (count - 1);
  const startY = getRowsStartY(align, frame.height, margin, totalHeight);

  return Array.from({ length: count }, (_row, index) => ({
    fill: guide.color,
    fillAlpha: guide.opacity / 100,
    height: rowHeight,
    width: frame.width,
    x: frame.x,
    y: frame.y + startY + index * (rowHeight + gutter),
  }));
};
