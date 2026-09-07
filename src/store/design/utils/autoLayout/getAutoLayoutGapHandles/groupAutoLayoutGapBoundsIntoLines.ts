// types
import { TAutoLayoutGapAxis } from './types';
import { TDraftRect } from 'types/canvas';

// utils
import { getAxisStart } from './getAutoLayoutGapAxisBounds';

export const groupAutoLayoutGapBoundsIntoLines = (bounds: TDraftRect[], axis: TAutoLayoutGapAxis): TDraftRect[][] => {
  const lines: TDraftRect[][] = [];
  let currentLine: TDraftRect[] = [];

  bounds.forEach((bound, index) => {
    const previous = bounds[index - 1];

    if (previous && getAxisStart(bound, axis) <= getAxisStart(previous, axis)) {
      lines.push(currentLine);
      currentLine = [];
    }

    currentLine.push(bound);
  });

  lines.push(currentLine);

  return lines;
};
