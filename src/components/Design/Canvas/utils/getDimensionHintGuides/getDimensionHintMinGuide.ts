// types
import { TDimensionHintFrame, TDimensionHintGuides } from './types';

// utils
import { EMPTY_DIMENSION_HINT_GUIDES } from './constants';

export const getDimensionHintMinGuide = (frame: TDimensionHintFrame, isWidth: boolean): TDimensionHintGuides => {
  const { height, minHeight, minWidth, width, x, y } = frame;
  const min = isWidth ? minWidth : minHeight;

  if (min !== undefined) {
    const right = x + width;
    const bottom = y + height;
    const text = isWidth ? `Min W ${Math.round(min)}` : `Min H ${Math.round(min)}`;

    if (isWidth) {
      return {
        labels: [{ anchor: { x: x + min, y: bottom }, color: 'red', offsetDirection: { x: 0, y: 1 }, text }],
        lines: [{ color: 'red', x1: x + min, x2: x + min, y1: y, y2: bottom }],
      };
    }

    return {
      labels: [{ anchor: { x: right, y: y + min }, color: 'red', offsetDirection: { x: 1, y: 0 }, text }],
      lines: [{ color: 'red', x1: x, x2: right, y1: y + min, y2: y + min }],
    };
  }

  return EMPTY_DIMENSION_HINT_GUIDES;
};
