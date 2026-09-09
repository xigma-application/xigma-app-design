// types
import { LayoutMode, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

export type TAutoLayoutWrapSizingModes = {
  counterMode: SizingMode;
  heightMode: SizingMode;
  isHorizontal: boolean;
  primaryMax: number | undefined;
  primaryMode: SizingMode;
  widthMode: SizingMode;
};

export const getAutoLayoutWrapSizingModes = (
  frame: TFrameNode,
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
): TAutoLayoutWrapSizingModes => {
  const widthMode = frame.widthSizingMode ?? SizingMode.fixed;
  const heightMode = frame.heightSizingMode ?? SizingMode.fixed;
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const primaryMode = isHorizontal ? widthMode : heightMode;
  const counterMode = isHorizontal ? heightMode : widthMode;
  const primaryMax = isHorizontal ? frame.maxWidth : frame.maxHeight;

  return { counterMode, heightMode, isHorizontal, primaryMax, primaryMode, widthMode };
};
