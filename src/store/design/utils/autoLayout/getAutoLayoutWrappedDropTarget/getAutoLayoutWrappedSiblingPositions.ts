// types
import { TAutoLayoutSiblingPositionsInput } from '../types';
import { TPoint } from 'types/canvas';

// utils
import { getAutoLayoutSiblingPositions } from '../getAutoLayoutDropTarget/getAutoLayoutSiblingPositions';
import { getAutoLayoutWrappedChildPositions } from '../getAutoLayoutWrappedChildPositions';

export const getAutoLayoutWrappedSiblingPositions = (input: TAutoLayoutSiblingPositionsInput): Record<string, TPoint> => {
  const { alignment, children, contentBox, counterAxisSpacing, draggedSizes, index, itemSpacing, layoutMode } = input;
  const simulatedChildren = [...children.slice(0, index), ...draggedSizes, ...children.slice(index)];
  const simulatedPositions = getAutoLayoutWrappedChildPositions(
    layoutMode,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    contentBox,
    simulatedChildren,
  );

  return getAutoLayoutSiblingPositions(simulatedPositions);
};
