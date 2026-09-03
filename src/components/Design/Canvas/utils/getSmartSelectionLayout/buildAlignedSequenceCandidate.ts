// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getAdjacentGapValue } from './getAdjacentGapValue';
import { hasPerpendicularOverlap } from './hasPerpendicularOverlap';

export type TAlignedSequenceCandidate = { gapValues: number[]; sorted: TSmartSelectionNode[] };

export const buildAlignedSequenceCandidate = (nodes: TSmartSelectionNode[], axis: 'x' | 'y'): TAlignedSequenceCandidate | null => {
  const sorted = [...nodes].sort((a, b) => a.bounds[axis] - b.bounds[axis]);
  const gapValues: number[] = [];

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];

    if (!hasPerpendicularOverlap(current.bounds, next.bounds, axis)) {
      return null;
    }

    const gap = getAdjacentGapValue(current.bounds, next.bounds, axis);

    if (gap < 0) {
      return null;
    }

    gapValues.push(gap);
  }

  return { gapValues, sorted };
};
