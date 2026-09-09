// types
import { AlignmentLayout, AutoSpacing, LayoutMode, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAutoLayoutPadding } from '../getAutoLayoutContentBox';
import { TFrameNode } from 'types/design/types';

// utils
import { computeAutoLayoutSingleLinePositions } from './computeAutoLayoutSingleLinePositions';
import { computeAutoLayoutWrappedPositions } from './computeAutoLayoutWrappedPositions/computeAutoLayoutWrappedPositions';

export const computeAutoLayoutPositions = (
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
  autoSpacing = AutoSpacing.between,
): TAutoLayoutChildPosition[] => {
  const widthMode = frame.widthSizingMode ?? SizingMode.fixed;
  const heightMode = frame.heightSizingMode ?? SizingMode.fixed;
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const primaryMode = isHorizontal ? widthMode : heightMode;
  const primaryMax = isHorizontal ? frame.maxWidth : frame.maxHeight;
  const hugWrapEligible = primaryMode !== SizingMode.hug || primaryMax !== undefined;
  const wrapEnabled = Boolean(frame.layoutWrap) && hugWrapEligible;

  if (wrapEnabled) {
    return computeAutoLayoutWrappedPositions(
      frame,
      layoutMode,
      itemSpacing,
      counterAxisSpacing,
      alignment,
      padding,
      sizes,
      isPrimaryGapAuto,
      isCounterGapAuto,
      alignTextBaseline,
      autoSpacing,
    );
  }

  return computeAutoLayoutSingleLinePositions(
    frame,
    layoutMode,
    itemSpacing,
    alignment,
    padding,
    sizes,
    isPrimaryGapAuto,
    alignTextBaseline,
    autoSpacing,
  );
};
