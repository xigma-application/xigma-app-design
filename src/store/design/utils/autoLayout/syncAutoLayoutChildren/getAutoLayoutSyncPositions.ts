// types
import { AlignmentLayout, GapMode, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { TFrameNode } from 'types/design/types';

// utils
import { computeAutoLayoutPositions } from '../computeAutoLayoutPositions/computeAutoLayoutPositions';
import { getFramePadding } from '../getFramePadding';

export const getAutoLayoutSyncPositions = (
  frame: TFrameNode,
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  sizes: TAutoLayoutChildSize[],
): TAutoLayoutChildPosition[] => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const itemSpacing = (isHorizontal ? frame.horizontalGap : frame.verticalGap) ?? 0;
  const counterAxisSpacing = (isHorizontal ? frame.verticalGap : frame.horizontalGap) ?? itemSpacing;
  const isPrimaryGapAuto = (isHorizontal ? frame.horizontalGapMode : frame.verticalGapMode) === GapMode.auto;
  const isCounterGapAuto = (isHorizontal ? frame.verticalGapMode : frame.horizontalGapMode) === GapMode.auto;
  const padding = getFramePadding(frame);
  const alignment = frame.layoutAlignment ?? AlignmentLayout.topLeft;

  return computeAutoLayoutPositions(
    frame,
    layoutMode,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    padding,
    sizes,
    isPrimaryGapAuto,
    isCounterGapAuto,
  );
};
