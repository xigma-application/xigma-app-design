// types
import { AlignmentLayout, LayoutMode, SizingMode } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';

// utils
import { getAlignmentComponents } from './getAlignmentComponents';
import { getAxisOffset } from './getAxisOffset';

export type TAutoLayoutChildSize = {
  height: number;
  heightSizingMode?: SizingMode;
  id: string;
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
): TAutoLayoutChildPosition[] => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const { x: xAlign, y: yAlign } = getAlignmentComponents(alignment);
  const primaryAlign = isHorizontal ? xAlign : yAlign;
  const counterAlign = isHorizontal ? yAlign : xAlign;
  const primarySize = isHorizontal ? frame.width : frame.height;
  const counterSize = isHorizontal ? frame.height : frame.width;
  const contentLength = children.reduce((total, child, index) => {
    const size = isHorizontal ? child.width : child.height;
    return total + size + (index > 0 ? itemSpacing : 0);
  }, 0);
  let offset = getAxisOffset(primaryAlign, primarySize, contentLength);

  return children.map((child) => {
    const size = isHorizontal ? child.width : child.height;
    const counterChildSize = isHorizontal ? child.height : child.width;
    const counterOffset = getAxisOffset(counterAlign, counterSize, counterChildSize);
    const position = isHorizontal
      ? { height: child.height, id: child.id, width: child.width, x: frame.x + offset, y: frame.y + counterOffset }
      : { height: child.height, id: child.id, width: child.width, x: frame.x + counterOffset, y: frame.y + offset };

    offset += size + itemSpacing;

    return position;
  });
};
