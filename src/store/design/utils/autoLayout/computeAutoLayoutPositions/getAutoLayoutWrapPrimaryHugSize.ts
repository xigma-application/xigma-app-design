// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAutoLayoutPadding } from '../getAutoLayoutContentBox';

// utils
import { getAutoLayoutLineLength } from '../getAutoLayoutLineLength';

export const getAutoLayoutWrapPrimaryHugSize = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  padding: TAutoLayoutPadding,
  lines: TAutoLayoutChildSize[][],
): number => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const lineLengths = lines.map((line) => getAutoLayoutLineLength(isHorizontal, itemSpacing, line));
  const contentLength = Math.max(0, ...lineLengths);

  return contentLength + (isHorizontal ? padding.paddingLeft + padding.paddingRight : padding.paddingTop + padding.paddingBottom);
};
