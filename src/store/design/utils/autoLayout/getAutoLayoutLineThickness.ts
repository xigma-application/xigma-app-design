// types
import { TAutoLayoutChildSize } from './getAutoLayoutChildPositions/getAutoLayoutChildPositions';

// utils
import { getAutoLayoutBaselineExtent } from './getAutoLayoutBaselineExtent';

export const getAutoLayoutLineThickness = (isHorizontal: boolean, line: TAutoLayoutChildSize[], alignTextBaseline = false): number => {
  if (alignTextBaseline) {
    return getAutoLayoutBaselineExtent(line).thickness;
  }

  return line.reduce((max, child) => Math.max(max, isHorizontal ? child.height : child.width), 0);
};
