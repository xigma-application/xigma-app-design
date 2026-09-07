// types
import { LayoutMode, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { TAutoLayoutPadding } from '../getAutoLayoutContentBox';
import { TFrameNode } from 'types/design/types';

// utils
import { getAutoLayoutHugSize } from './getAutoLayoutHugSize';

export const applyAutoLayoutHugSize = (
  frame: TFrameNode,
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  padding: TAutoLayoutPadding,
  sizes: TAutoLayoutChildSize[],
): void => {
  const widthMode = frame.widthSizingMode ?? SizingMode.fixed;
  const heightMode = frame.heightSizingMode ?? SizingMode.fixed;

  if (widthMode === SizingMode.hug || heightMode === SizingMode.hug) {
    const hugSize = getAutoLayoutHugSize(layoutMode, itemSpacing, padding, sizes);

    if (widthMode === SizingMode.hug) {
      frame.width = hugSize.width;
    }

    if (heightMode === SizingMode.hug) {
      frame.height = hugSize.height;
    }
  }
};
