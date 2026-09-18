// types
import { StrokeSides } from 'types/design/enums';
import { TStrokeSideSource } from './types';

// utils
import { getStrokeSideWidths } from './getStrokeSideWidths';

export const getStrokeWeightDisplay = (node: TStrokeSideSource): number | null => {
  if (node.strokeSides === StrokeSides.custom) {
    const { bottom, left, right, top } = getStrokeSideWidths(node);
    return left === top && top === right && right === bottom ? top : null;
  }

  return node.strokeWidth ?? 1;
};
