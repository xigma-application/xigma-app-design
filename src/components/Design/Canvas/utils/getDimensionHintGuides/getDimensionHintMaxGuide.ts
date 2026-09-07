// types
import { TDimensionHintFrame, TDimensionHintGuides } from './types';

// utils
import { EMPTY_DIMENSION_HINT_GUIDES } from './constants';

export const getDimensionHintMaxGuide = (frame: TDimensionHintFrame, isWidth: boolean): TDimensionHintGuides => {
  const { height, maxHeight, maxWidth, width, x, y } = frame;
  const max = isWidth ? maxWidth : maxHeight;
  const current = isWidth ? width : height;

  if (max !== undefined && current < max) {
    const right = x + width;
    const bottom = y + height;
    const text = isWidth ? `Max W ${Math.round(max)}` : `Max H ${Math.round(max)}`;

    if (isWidth) {
      return {
        labels: [{ anchor: { x: x + max, y: y + height / 2 }, color: 'red', offsetDirection: { x: 1, y: 0 }, text }],
        lines: [
          { color: 'red', x1: x + max, x2: x + max, y1: y, y2: bottom },
          { arrowAtEnd: true, color: 'blue', dashed: true, x1: right, x2: x + max, y1: y, y2: y },
          { arrowAtEnd: true, color: 'blue', dashed: true, x1: right, x2: x + max, y1: bottom, y2: bottom },
        ],
      };
    }

    return {
      labels: [{ anchor: { x: x + width / 2, y: y + max }, color: 'red', offsetDirection: { x: 0, y: 1 }, text }],
      lines: [
        { color: 'red', x1: x, x2: right, y1: y + max, y2: y + max },
        { arrowAtEnd: true, color: 'blue', dashed: true, x1: x, x2: x, y1: bottom, y2: y + max },
        { arrowAtEnd: true, color: 'blue', dashed: true, x1: right, x2: right, y1: bottom, y2: y + max },
      ],
    };
  }

  return EMPTY_DIMENSION_HINT_GUIDES;
};
