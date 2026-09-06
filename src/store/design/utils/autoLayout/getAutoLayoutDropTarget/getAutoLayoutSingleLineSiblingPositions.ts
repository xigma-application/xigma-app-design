// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAutoLayoutChildPositions, type TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { getAutoLayoutSiblingPositions } from './getAutoLayoutSiblingPositions';

export const getAutoLayoutSingleLineSiblingPositions = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  alignment: AlignmentLayout,
  contentBox: TDraftRect,
  children: TAutoLayoutChildSize[],
  index: number,
  draggedSizes: TAutoLayoutChildSize[],
): Record<string, TPoint> => {
  const simulatedChildren = [...children.slice(0, index), ...draggedSizes, ...children.slice(index)];
  const simulatedPositions = getAutoLayoutChildPositions(layoutMode, itemSpacing, alignment, contentBox, simulatedChildren);

  return getAutoLayoutSiblingPositions(simulatedPositions);
};
