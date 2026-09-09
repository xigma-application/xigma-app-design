// types
import { AlignTextBaseline, AlignmentLayout, AutoSpacing, GapMode, LayoutMode, LayoutVersion } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TFrameNode } from 'types/design/types';

// utils
import { computeAutoLayoutPositions } from '../computeAutoLayoutPositions/computeAutoLayoutPositions';
import { getFrameLayoutPadding } from '../getFrameLayoutPadding';

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
  const alignment = frame.layoutAlignment ?? AlignmentLayout.topLeft;
  const alignTextBaseline = isHorizontal && frame.alignTextBaseline === AlignTextBaseline.on;
  const autoSpacing = frame.autoSpacing ?? AutoSpacing.between;
  const layoutVersion = frame.layoutVersion ?? LayoutVersion.updated;
  const padding = getFrameLayoutPadding(frame, layoutVersion);

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
    alignTextBaseline,
    autoSpacing,
    layoutVersion,
  );
};
