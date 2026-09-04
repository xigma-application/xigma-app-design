// types
import { AlignmentLayout, LayoutMode, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { applyAutoLayoutHugSize } from './applyAutoLayoutHugSize';
import { getAutoLayoutChildPositions, TAutoLayoutChildPosition, TAutoLayoutChildSize } from './getAutoLayoutChildPositions';
import { getAutoLayoutContentBox, TAutoLayoutPadding } from './getAutoLayoutContentBox';
import { getAutoLayoutWrapCounterHugSize } from './getAutoLayoutWrapCounterHugSize';
import { getAutoLayoutWrappedChildPositions } from './getAutoLayoutWrappedChildPositions';
import { groupAutoLayoutChildrenIntoLines } from './groupAutoLayoutChildrenIntoLines';

export const computeAutoLayoutPositions = (
  frame: TFrameNode,
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  padding: TAutoLayoutPadding,
  sizes: TAutoLayoutChildSize[],
): TAutoLayoutChildPosition[] => {
  const primaryMode = frame.primaryAxisSizingMode ?? SizingMode.fixed;
  const counterMode = frame.counterAxisSizingMode ?? SizingMode.fixed;
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const wrapEnabled = Boolean(frame.layoutWrap) && primaryMode !== SizingMode.hug;

  if (wrapEnabled) {
    const preContentBox = getAutoLayoutContentBox(frame, padding);
    const availablePrimary = isHorizontal ? preContentBox.width : preContentBox.height;
    const lines = groupAutoLayoutChildrenIntoLines(isHorizontal, itemSpacing, availablePrimary, sizes);

    if (counterMode === SizingMode.hug) {
      const huggedCounterSize = getAutoLayoutWrapCounterHugSize(layoutMode, counterAxisSpacing, padding, lines);

      if (isHorizontal) {
        frame.height = huggedCounterSize;
      } else {
        frame.width = huggedCounterSize;
      }
    }

    const contentBox = getAutoLayoutContentBox(frame, padding);

    return getAutoLayoutWrappedChildPositions(layoutMode, itemSpacing, counterAxisSpacing, alignment, contentBox, sizes);
  }

  applyAutoLayoutHugSize(frame, layoutMode, itemSpacing, padding, sizes);

  const contentBox = getAutoLayoutContentBox(frame, padding);

  return getAutoLayoutChildPositions(layoutMode, itemSpacing, alignment, contentBox, sizes);
};
