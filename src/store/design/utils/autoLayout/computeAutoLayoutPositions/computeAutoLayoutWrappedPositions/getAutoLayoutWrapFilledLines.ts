// types
import { LayoutVersion, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDraftRect } from 'types/canvas';
import { TFrameNode } from 'types/design/types';

// utils
import { getAutoLayoutContentBox, TAutoLayoutPadding } from '../../getAutoLayoutContentBox';
import { getAutoLayoutFilledLines } from '../getAutoLayoutFilledLines';

export type TAutoLayoutWrapFilledLines = {
  contentBox: TDraftRect;
  filledLines: TAutoLayoutChildSize[][];
};

export const getAutoLayoutWrapFilledLines = (
  frame: TFrameNode,
  padding: TAutoLayoutPadding,
  isHorizontal: boolean,
  itemSpacing: number,
  widthMode: SizingMode,
  heightMode: SizingMode,
  lines: TAutoLayoutChildSize[][],
  alignTextBaseline = false,
  layoutVersion: LayoutVersion = LayoutVersion.updated,
): TAutoLayoutWrapFilledLines => {
  const contentBox = getAutoLayoutContentBox(frame, padding);
  const availableContentPrimary = isHorizontal ? contentBox.width : contentBox.height;
  const filledLines = getAutoLayoutFilledLines(
    isHorizontal,
    itemSpacing,
    availableContentPrimary,
    widthMode,
    heightMode,
    lines,
    alignTextBaseline,
    layoutVersion,
  );

  return { contentBox, filledLines };
};
