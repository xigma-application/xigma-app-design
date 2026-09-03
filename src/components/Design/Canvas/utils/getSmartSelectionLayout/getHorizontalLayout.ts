// types
import { TSmartSelectionNode, TSmartSelectionRowLayout } from 'types/design/smartSelection/types';

// utils
import { areGapsUniform } from './areGapsUniform';
import { buildAlignedSequenceCandidate } from './buildAlignedSequenceCandidate';
import { buildHorizontalGap } from './buildHorizontalGap';

export const getHorizontalLayout = (nodes: TSmartSelectionNode[], toleranceWorldUnits: number): TSmartSelectionRowLayout | null => {
  const candidate = buildAlignedSequenceCandidate(nodes, 'x');

  if (candidate && areGapsUniform(candidate.gapValues, toleranceWorldUnits)) {
    return {
      gaps: candidate.gapValues.map((value, index) =>
        buildHorizontalGap(candidate.sorted[index], candidate.sorted[index + 1], index, value),
      ),
      nodes: candidate.sorted,
      type: 'row',
    };
  }

  return null;
};
