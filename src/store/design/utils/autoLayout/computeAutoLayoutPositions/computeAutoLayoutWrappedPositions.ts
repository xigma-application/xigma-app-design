// types
import { AlignmentLayout, LayoutMode, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { TFrameNode } from 'types/design/types';

// utils
import { applyAutoLayoutWrapCounterHugSize } from './applyAutoLayoutWrapCounterHugSize';
import { applyAutoLayoutWrapPrimaryHugSize } from './applyAutoLayoutWrapPrimaryHugSize';
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
  isPrimaryGapAuto: boolean,
  isCounterGapAuto: boolean,
  alignTextBaseline = false,
): TAutoLayoutChildPosition[] => {
  const widthMode = frame.widthSizingMode ?? SizingMode.fixed;
  const heightMode = frame.heightSizingMode ?? SizingMode.fixed;
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const primaryMode = isHorizontal ? widthMode : heightMode;
  const counterMode = isHorizontal ? heightMode : widthMode;
  const primaryMax = isHorizontal ? frame.maxWidth : frame.maxHeight;
  const preContentBox = getAutoLayoutContentBox(frame, padding);
  const primaryPadding = isHorizontal ? padding.paddingLeft + padding.paddingRight : padding.paddingTop + padding.paddingBottom;
  const availablePrimary =
    primaryMode === SizingMode.hug && primaryMax !== undefined
      ? primaryMax - primaryPadding
      : isHorizontal
        ? preContentBox.width
        : preContentBox.height;
  const lines = groupAutoLayoutChildrenIntoLines(isHorizontal, itemSpacing, availablePrimary, sizes);

  if (primaryMode === SizingMode.hug) {
    applyAutoLayoutWrapPrimaryHugSize(frame, layoutMode, itemSpacing, padding, lines);
  }

  if (counterMode === SizingMode.hug) {
    applyAutoLayoutWrapCounterHugSize(frame, layoutMode, counterAxisSpacing, padding, lines, alignTextBaseline);
  }

  const contentBox = getAutoLayoutContentBox(frame, padding);
  const availableContentPrimary = isHorizontal ? contentBox.width : contentBox.height;
  const filledLines = getAutoLayoutFilledLines(
    isHorizontal,
    itemSpacing,
    availableContentPrimary,
    widthMode,
    heightMode,
    lines,
    alignTextBaseline,
  );

  return getAutoLayoutWrappedChildPositions(
    layoutMode,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    contentBox,
    filledLines,
    isPrimaryGapAuto,
    isCounterGapAuto,
    alignTextBaseline,
  );
};
