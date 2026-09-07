// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutSiblingPositionsInput } from '../types';
import { TPoint } from 'types/canvas';

// utils
import { getAutoLayoutSiblingPositions } from '../getAutoLayoutDropTarget/getAutoLayoutSiblingPositions';
import { getAutoLayoutWrappedChildPositions } from '../getAutoLayoutWrappedChildPositions';
import { groupAutoLayoutChildrenIntoLines } from '../groupAutoLayoutChildrenIntoLines';

export const getAutoLayoutWrappedSiblingPositions = (input: TAutoLayoutSiblingPositionsInput): Record<string, TPoint> => {
  const { alignment, children, contentBox, counterAxisSpacing, draggedSizes, index, itemSpacing, layoutMode } = input;
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const availablePrimary = isHorizontal ? contentBox.width : contentBox.height;
  const simulatedChildren = [...children.slice(0, index), ...draggedSizes, ...children.slice(index)];
  const simulatedLines = groupAutoLayoutChildrenIntoLines(isHorizontal, itemSpacing, availablePrimary, simulatedChildren);
  const simulatedPositions = getAutoLayoutWrappedChildPositions(
    layoutMode,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    contentBox,
    simulatedLines,
  );

  return getAutoLayoutSiblingPositions(simulatedPositions);
};
