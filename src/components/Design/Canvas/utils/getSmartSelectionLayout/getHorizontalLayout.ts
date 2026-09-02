// types
import { TSmartSelectionNode, TSmartSelectionRowLayout } from 'types/design/smartSelection/types';

// utils
import { areGapsUniform } from './areGapsUniform';
import { buildHorizontalGap } from './buildHorizontalGap';
import { getAdjacentGapValue } from './getAdjacentGapValue';
import { hasPerpendicularOverlap } from './hasPerpendicularOverlap';

export const getHorizontalLayout = (nodes: TSmartSelectionNode[], toleranceWorldUnits: number): TSmartSelectionRowLayout | null => {
  const sorted = [...nodes].sort((a, b) => a.bounds.x - b.bounds.x);
  const gapValues: number[] = [];

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];

    if (!hasPerpendicularOverlap(current.bounds, next.bounds, 'x')) {
      return null;
    }

    const gap = getAdjacentGapValue(current.bounds, next.bounds, 'x');

    if (gap < 0) {
      return null;
    }

    gapValues.push(gap);
  }

  if (!areGapsUniform(gapValues, toleranceWorldUnits)) {
    return null;
  }

  return {
    gaps: gapValues.map((value, index) => buildHorizontalGap(sorted[index], sorted[index + 1], index, value)),
    nodes: sorted,
    type: 'row',
  };
};
