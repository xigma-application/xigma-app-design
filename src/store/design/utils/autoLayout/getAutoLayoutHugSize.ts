// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from './getAutoLayoutChildPositions';
import { TAutoLayoutPadding } from './getAutoLayoutContentBox';

export const getAutoLayoutHugSize = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  padding: TAutoLayoutPadding,
  children: TAutoLayoutChildSize[],
): { height: number; width: number } => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const contentLength = children.reduce((total, child, index) => {
    const size = isHorizontal ? child.width : child.height;
    return total + size + (index > 0 ? itemSpacing : 0);
  }, 0);
  const counterLength = children.reduce((max, child) => Math.max(max, isHorizontal ? child.height : child.width), 0);
  const primarySize =
    contentLength + (isHorizontal ? padding.paddingLeft + padding.paddingRight : padding.paddingTop + padding.paddingBottom);
  const counterSize =
    counterLength + (isHorizontal ? padding.paddingTop + padding.paddingBottom : padding.paddingLeft + padding.paddingRight);

  return isHorizontal ? { height: counterSize, width: primarySize } : { height: primarySize, width: counterSize };
};
