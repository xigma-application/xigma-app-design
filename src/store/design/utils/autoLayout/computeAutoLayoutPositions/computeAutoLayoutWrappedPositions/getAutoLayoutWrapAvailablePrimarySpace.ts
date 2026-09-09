// types
import { SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getAutoLayoutContentBox, TAutoLayoutPadding } from '../../getAutoLayoutContentBox';

export const getAutoLayoutWrapAvailablePrimarySpace = (
  frame: TFrameNode,
  isHorizontal: boolean,
  primaryMode: SizingMode,
  primaryMax: number | undefined,
  padding: TAutoLayoutPadding,
): number => {
  const contentBox = getAutoLayoutContentBox(frame, padding);
  const primaryPadding = isHorizontal ? padding.paddingLeft + padding.paddingRight : padding.paddingTop + padding.paddingBottom;

  return primaryMode === SizingMode.hug && primaryMax !== undefined
    ? primaryMax - primaryPadding
    : isHorizontal
      ? contentBox.width
      : contentBox.height;
};
