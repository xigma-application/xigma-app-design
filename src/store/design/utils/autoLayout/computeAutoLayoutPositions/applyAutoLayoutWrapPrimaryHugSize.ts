// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { TAutoLayoutPadding } from '../getAutoLayoutContentBox';
import { TFrameNode } from 'types/design/types';

// utils
import { clampAutoLayoutSize } from '../clampAutoLayoutSize';
import { getAutoLayoutWrapPrimaryHugSize } from './getAutoLayoutWrapPrimaryHugSize';

export const applyAutoLayoutWrapPrimaryHugSize = (
  frame: TFrameNode,
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  padding: TAutoLayoutPadding,
  lines: TAutoLayoutChildSize[][],
): void => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const huggedPrimarySize = getAutoLayoutWrapPrimaryHugSize(layoutMode, itemSpacing, padding, lines);

  if (isHorizontal) {
    frame.width = clampAutoLayoutSize(huggedPrimarySize, frame.minWidth, frame.maxWidth);
  } else {
    frame.height = clampAutoLayoutSize(huggedPrimarySize, frame.minHeight, frame.maxHeight);
  }
};
