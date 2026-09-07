// types
import { TAutoLayoutGapAxis } from './types';
import { TDraftRect } from 'types/canvas';

// utils
import { buildAutoLayoutGapRect } from './buildAutoLayoutGapRect';
import { getAxisEnd, getAxisStart } from './getAutoLayoutGapAxisBounds';

export const getAutoLayoutBetweenLineGaps = (lines: TDraftRect[][], axis: TAutoLayoutGapAxis): TDraftRect[] => {
  const perpendicular = axis === 'x' ? 'y' : 'x';

  return lines.slice(1).map((line, index) => {
    const previousLine = lines[index];
    const combined = [...previousLine, ...line];
    const bandStart = Math.min(...combined.map((bound) => getAxisStart(bound, axis)));
    const bandEnd = Math.max(...combined.map((bound) => getAxisEnd(bound, axis)));
    const gapStart = Math.max(...previousLine.map((bound) => getAxisEnd(bound, perpendicular)));
    const gapEnd = Math.min(...line.map((bound) => getAxisStart(bound, perpendicular)));

    return buildAutoLayoutGapRect(perpendicular, gapStart, gapEnd, bandStart, bandEnd);
  });
};
