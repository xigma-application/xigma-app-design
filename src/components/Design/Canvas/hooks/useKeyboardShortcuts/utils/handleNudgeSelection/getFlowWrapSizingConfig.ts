// types
import { LayoutMode, LayoutVersion } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getAutoLayoutWrapAvailablePrimarySpace } from 'store/design/utils/autoLayout/computeAutoLayoutPositions/computeAutoLayoutWrappedPositions/getAutoLayoutWrapAvailablePrimarySpace';
import { getAutoLayoutWrapSizingModes } from 'store/design/utils/autoLayout/computeAutoLayoutPositions/computeAutoLayoutWrappedPositions/getAutoLayoutWrapSizingModes';
import { getFrameLayoutPadding } from 'store/design/utils/autoLayout/getFrameLayoutPadding';

export type TFlowWrapSizingConfig = { availablePrimary: number; isHorizontal: boolean; itemSpacing: number };

export const getFlowWrapSizingConfig = (frame: TFrameNode): TFlowWrapSizingConfig => {
  const layoutMode = frame.layoutMode as LayoutMode.horizontal | LayoutMode.vertical;
  const { isHorizontal, primaryMax, primaryMode } = getAutoLayoutWrapSizingModes(frame, layoutMode);
  const padding = getFrameLayoutPadding(frame, frame.layoutVersion ?? LayoutVersion.updated);
  const availablePrimary = getAutoLayoutWrapAvailablePrimarySpace(frame, isHorizontal, primaryMode, primaryMax, padding);
  const itemSpacing = (isHorizontal ? frame.horizontalGap : frame.verticalGap) ?? 0;

  return { availablePrimary, isHorizontal, itemSpacing };
};
