// types
import { AlignmentLayout, LayoutMode, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { applyAutoLayoutHugSize } from './applyAutoLayoutHugSize';
import { getAutoLayoutChildPositions, TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { getAutoLayoutContentBox, TAutoLayoutPadding } from '../getAutoLayoutContentBox';
import { getAutoLayoutFillSizes } from './getAutoLayoutFillSizes';
import { getFillableAutoLayoutSizes } from './getFillableAutoLayoutSizes';

export const computeAutoLayoutSingleLinePositions = (
  frame: TFrameNode,
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  alignment: AlignmentLayout,
  padding: TAutoLayoutPadding,
  sizes: TAutoLayoutChildSize[],
  isPrimaryGapAuto: boolean,
  alignTextBaseline = false,
): TAutoLayoutChildPosition[] => {
  const widthMode = frame.widthSizingMode ?? SizingMode.fixed;
  const heightMode = frame.heightSizingMode ?? SizingMode.fixed;
  const isHorizontal = layoutMode === LayoutMode.horizontal;

  applyAutoLayoutHugSize(frame, layoutMode, itemSpacing, padding, sizes, alignTextBaseline);

  const contentBox = getAutoLayoutContentBox(frame, padding);
  const availablePrimary = isHorizontal ? contentBox.width : contentBox.height;
  const availableCounter = isHorizontal ? contentBox.height : contentBox.width;
  const fillableSizes = getFillableAutoLayoutSizes(sizes, widthMode, heightMode);
  const filledSizes = getAutoLayoutFillSizes(isHorizontal, itemSpacing, availablePrimary, availableCounter, fillableSizes);

  return getAutoLayoutChildPositions(layoutMode, itemSpacing, alignment, contentBox, filledSizes, isPrimaryGapAuto, alignTextBaseline);
};
