// types
import { TDimensionHintFrame, TDimensionHintGuides } from './types';

export const getDimensionHintEdgeGuide = (frame: TDimensionHintFrame, isWidth: boolean): TDimensionHintGuides => {
  const { height, width, x, y } = frame;
  const right = x + width;
  const bottom = y + height;

  if (isWidth) {
    return { labels: [], lines: [{ color: 'blue', x1: right, x2: right, y1: y, y2: bottom }] };
  }

  return { labels: [], lines: [{ color: 'blue', x1: x, x2: right, y1: bottom, y2: bottom }] };
};
