// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAutoLayoutPadding } from '../getAutoLayoutContentBox';
import { TFrameNode } from 'types/design/types';

// utils
import { getAutoLayoutWrapCounterHugSize } from './getAutoLayoutWrapCounterHugSize';

export const applyAutoLayoutWrapCounterHugSize = (
  frame: TFrameNode,
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  counterAxisSpacing: number,
  padding: TAutoLayoutPadding,
  lines: TAutoLayoutChildSize[][],
  alignTextBaseline = false,
): void => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const huggedCounterSize = getAutoLayoutWrapCounterHugSize(layoutMode, counterAxisSpacing, padding, lines, alignTextBaseline);

  if (isHorizontal) {
    frame.height = huggedCounterSize;
  } else {
    frame.width = huggedCounterSize;
  }
};
