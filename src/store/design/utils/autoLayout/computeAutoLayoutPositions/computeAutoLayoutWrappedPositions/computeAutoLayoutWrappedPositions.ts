// types
import { AlignmentLayout, AutoSpacing, LayoutMode, LayoutVersion } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAutoLayoutPadding } from '../../getAutoLayoutContentBox';
import { TFrameNode } from 'types/design/types';

// utils
import { buildAutoLayoutWrapLines } from './buildAutoLayoutWrapLines';
import { getAutoLayoutWrapAvailablePrimarySpace } from './getAutoLayoutWrapAvailablePrimarySpace';
import { getAutoLayoutWrapFilledLines } from './getAutoLayoutWrapFilledLines';
import { getAutoLayoutWrapSizingModes } from './getAutoLayoutWrapSizingModes';
import { getAutoLayoutWrappedChildPositions } from '../../getAutoLayoutWrappedChildPositions/getAutoLayoutWrappedChildPositions';

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
  autoSpacing = AutoSpacing.between,
  layoutVersion = LayoutVersion.updated,
): TAutoLayoutChildPosition[] => {
  const { counterMode, heightMode, isHorizontal, primaryMax, primaryMode, widthMode } = getAutoLayoutWrapSizingModes(frame, layoutMode);
  const availablePrimary = getAutoLayoutWrapAvailablePrimarySpace(frame, isHorizontal, primaryMode, primaryMax, padding);
  const lines = buildAutoLayoutWrapLines(
    frame,
    layoutMode,
    itemSpacing,
    counterAxisSpacing,
    padding,
    sizes,
    primaryMode,
    counterMode,
    availablePrimary,
    alignTextBaseline,
  );
  const { contentBox, filledLines } = getAutoLayoutWrapFilledLines(
    frame,
    padding,
    isHorizontal,
    itemSpacing,
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
    autoSpacing,
    layoutVersion,
  );
};
