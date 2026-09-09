// types
import { AlignmentLayout, LayoutMode, SizingMode } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';

// utils
import { getAlignmentComponents } from './getAlignmentComponents';
import { getAutoLayoutBaselineExtent } from './getAutoLayoutBaselineExtent';
import { getAutoLayoutChildBaselineOffset } from './getAutoLayoutChildBaselineOffset';
import { getAxisOffset } from './getAxisOffset';
import { getDistributedGap } from './getDistributedGap';

export type TAutoLayoutChildSize = {
  fontSize?: number;
  height: number;
  heightSizingMode?: SizingMode;
  id: string;
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  width: number;
  widthSizingMode?: SizingMode;
};

export type TAutoLayoutChildPosition = { height: number; id: string; width: number; x: number; y: number };

export const getAutoLayoutChildPositions = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  alignment: AlignmentLayout,
  frame: TDraftRect,
  children: TAutoLayoutChildSize[],
  isPrimaryGapAuto = false,
  alignTextBaseline = false,
): TAutoLayoutChildPosition[] => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const { x: xAlign, y: yAlign } = getAlignmentComponents(alignment);
  const primaryAlign = isHorizontal ? xAlign : yAlign;
  const counterAlign = isHorizontal ? yAlign : xAlign;
  const primarySize = isHorizontal ? frame.width : frame.height;
  const counterSize = isHorizontal ? frame.height : frame.width;
  const childrenPrimarySize = children.reduce((total, child) => total + (isHorizontal ? child.width : child.height), 0);
  const effectiveGap = isPrimaryGapAuto ? getDistributedGap(primarySize, childrenPrimarySize, children.length) : itemSpacing;
  const contentLength = childrenPrimarySize + effectiveGap * Math.max(0, children.length - 1);
  let offset = isPrimaryGapAuto ? 0 : getAxisOffset(primaryAlign, primarySize, contentLength);
  const { maxBaseline } = getAutoLayoutBaselineExtent(children);

  return children.map((child) => {
    const size = isHorizontal ? child.width : child.height;
    const counterChildSize = isHorizontal ? child.height : child.width;
    const counterOffset = alignTextBaseline
      ? maxBaseline - getAutoLayoutChildBaselineOffset(child)
      : getAxisOffset(counterAlign, counterSize, counterChildSize);
    const position = isHorizontal
      ? { height: child.height, id: child.id, width: child.width, x: frame.x + offset, y: frame.y + counterOffset }
      : { height: child.height, id: child.id, width: child.width, x: frame.x + counterOffset, y: frame.y + offset };

    offset += size + effectiveGap;

    return position;
  });
};
