// types
import { LayoutMode, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAutoLayoutPadding } from '../../getAutoLayoutContentBox';
import { TFrameNode } from 'types/design/types';

// utils
import { applyAutoLayoutWrapCounterHugSize } from '../applyAutoLayoutWrapCounterHugSize';
import { applyAutoLayoutWrapPrimaryHugSize } from '../applyAutoLayoutWrapPrimaryHugSize';
import { groupAutoLayoutChildrenIntoLines } from '../../groupAutoLayoutChildrenIntoLines';

export const buildAutoLayoutWrapLines = (
  frame: TFrameNode,
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  counterAxisSpacing: number,
  padding: TAutoLayoutPadding,
  sizes: TAutoLayoutChildSize[],
  primaryMode: SizingMode,
  counterMode: SizingMode,
  availablePrimary: number,
  alignTextBaseline = false,
): TAutoLayoutChildSize[][] => {
  const lines = groupAutoLayoutChildrenIntoLines(layoutMode === LayoutMode.horizontal, itemSpacing, availablePrimary, sizes);

  switch (primaryMode) {
    case SizingMode.hug:
      applyAutoLayoutWrapPrimaryHugSize(frame, layoutMode, itemSpacing, padding, lines);
      break;
    default:
      break;
  }
  switch (counterMode) {
    case SizingMode.hug:
      applyAutoLayoutWrapCounterHugSize(frame, layoutMode, counterAxisSpacing, padding, lines, alignTextBaseline);
      break;
    default:
      break;
  }

  return lines;
};
