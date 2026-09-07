// types
import { AlignmentLayout, LayoutMode, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { TFrameNode } from 'types/design/types';

// utils
import { applyAutoLayoutWrapCounterHugSize } from './applyAutoLayoutWrapCounterHugSize';
import { getAutoLayoutContentBox, TAutoLayoutPadding } from '../getAutoLayoutContentBox';
import { getAutoLayoutFilledLines } from './getAutoLayoutFilledLines';
import { getAutoLayoutWrappedChildPositions } from '../getAutoLayoutWrappedChildPositions';
import { groupAutoLayoutChildrenIntoLines } from '../groupAutoLayoutChildrenIntoLines';

export const computeAutoLayoutWrappedPositions = (
  frame: TFrameNode,
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  padding: TAutoLayoutPadding,
  sizes: TAutoLayoutChildSize[],
): TAutoLayoutChildPosition[] => {
  const widthMode = frame.widthSizingMode ?? SizingMode.fixed;
  const heightMode = frame.heightSizingMode ?? SizingMode.fixed;
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const counterMode = isHorizontal ? heightMode : widthMode;
  const preContentBox = getAutoLayoutContentBox(frame, padding);
  const availablePrimary = isHorizontal ? preContentBox.width : preContentBox.height;
  const lines = groupAutoLayoutChildrenIntoLines(isHorizontal, itemSpacing, availablePrimary, sizes);

  if (counterMode === SizingMode.hug) {
    applyAutoLayoutWrapCounterHugSize(frame, layoutMode, counterAxisSpacing, padding, lines);
  }

  const contentBox = getAutoLayoutContentBox(frame, padding);
  const availableContentPrimary = isHorizontal ? contentBox.width : contentBox.height;
  const filledLines = getAutoLayoutFilledLines(isHorizontal, itemSpacing, availableContentPrimary, widthMode, heightMode, lines);

  return getAutoLayoutWrappedChildPositions(layoutMode, itemSpacing, counterAxisSpacing, alignment, contentBox, filledLines);
};
