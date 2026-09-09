// types
import { AlignmentLayout, AutoSpacing, LayoutMode, LayoutVersion, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAutoLayoutPadding } from '../getAutoLayoutContentBox';
import { TFrameNode } from 'types/design/types';

// utils
import { clampAutoLayoutFrameToPadding } from './clampAutoLayoutFrameToPadding';
import { computeAutoLayoutSingleLinePositions } from './computeAutoLayoutSingleLinePositions';
import { computeAutoLayoutWrappedPositions } from './computeAutoLayoutWrappedPositions/computeAutoLayoutWrappedPositions';
import { isAutoLayoutWrapEnabled } from './isAutoLayoutWrapEnabled';

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
  layoutVersion = LayoutVersion.updated,
): TAutoLayoutChildPosition[] => {
  const widthMode = frame.widthSizingMode ?? SizingMode.fixed;
  const heightMode = frame.heightSizingMode ?? SizingMode.fixed;
  const isHorizontal = layoutMode === LayoutMode.horizontal;

  clampAutoLayoutFrameToPadding(frame, widthMode, heightMode, padding, layoutVersion);

  if (isAutoLayoutWrapEnabled(frame, isHorizontal, widthMode, heightMode)) {
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
      layoutVersion,
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
    layoutVersion,
  );
};
