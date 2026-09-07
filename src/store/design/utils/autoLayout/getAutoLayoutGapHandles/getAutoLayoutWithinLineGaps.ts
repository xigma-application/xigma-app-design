// types
import { TAutoLayoutGapAxis } from './types';
import { TDraftRect } from 'types/canvas';

// utils
import { buildAutoLayoutGapRect } from './buildAutoLayoutGapRect';
import { getAxisEnd, getAxisStart } from './getAutoLayoutGapAxisBounds';

export const getAutoLayoutWithinLineGaps = (lines: TDraftRect[][], axis: TAutoLayoutGapAxis): TDraftRect[] => {
  const perpendicular = axis === 'x' ? 'y' : 'x';

  return lines.flatMap((line) => {
    const bandStart = Math.min(...line.map((bound) => getAxisStart(bound, perpendicular)));
    const bandEnd = Math.max(...line.map((bound) => getAxisEnd(bound, perpendicular)));

    return line
      .slice(1)
      .map((bound, index) => buildAutoLayoutGapRect(axis, getAxisEnd(line[index], axis), getAxisStart(bound, axis), bandStart, bandEnd));
  });
};
