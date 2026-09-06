// types
import { TAutoLayoutSiblingPositionsInput } from '../types';
import { TPoint } from 'types/canvas';

// utils
import { getAutoLayoutChildPositions } from '../getAutoLayoutChildPositions';
import { getAutoLayoutSiblingPositions } from './getAutoLayoutSiblingPositions';

export const getAutoLayoutSingleLineSiblingPositions = (input: TAutoLayoutSiblingPositionsInput): Record<string, TPoint> => {
  const { alignment, children, contentBox, draggedSizes, index, itemSpacing, layoutMode } = input;
  const simulatedChildren = [...children.slice(0, index), ...draggedSizes, ...children.slice(index)];
  const simulatedPositions = getAutoLayoutChildPositions(layoutMode, itemSpacing, alignment, contentBox, simulatedChildren);

  return getAutoLayoutSiblingPositions(simulatedPositions);
};
