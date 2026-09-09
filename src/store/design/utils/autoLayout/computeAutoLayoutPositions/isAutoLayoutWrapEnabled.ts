// types
import { SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

export const isAutoLayoutWrapEnabled = (
  frame: TFrameNode,
  isHorizontal: boolean,
  widthMode: SizingMode,
  heightMode: SizingMode,
): boolean => {
  const primaryMode = isHorizontal ? widthMode : heightMode;
  const primaryMax = isHorizontal ? frame.maxWidth : frame.maxHeight;
  const hugWrapEligible = primaryMode !== SizingMode.hug || primaryMax !== undefined;

  return Boolean(frame.layoutWrap) && hugWrapEligible;
};
