// types
import { TSmartSelectionColumnLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { areGapsUniform } from './areGapsUniform';
import { buildVerticalGap } from './buildVerticalGap';
import { getAdjacentGapValue } from './getAdjacentGapValue';
import { hasPerpendicularOverlap } from './hasPerpendicularOverlap';

export const getVerticalLayout = (nodes: TSmartSelectionNode[], toleranceWorldUnits: number): TSmartSelectionColumnLayout | null => {
  const sorted = [...nodes].sort((a, b) => a.bounds.y - b.bounds.y);
  const gapValues: number[] = [];

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];

    if (!hasPerpendicularOverlap(current.bounds, next.bounds, 'y')) {
      return null;
    }

    const gap = getAdjacentGapValue(current.bounds, next.bounds, 'y');

    if (gap < 0) {
      return null;
    }

    gapValues.push(gap);
  }

  if (!areGapsUniform(gapValues, toleranceWorldUnits)) {
    return null;
  }

  return {
    gaps: gapValues.map((value, index) => buildVerticalGap(sorted[index], sorted[index + 1], index, value)),
    nodes: sorted,
    type: 'column',
  };
};
