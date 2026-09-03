// types
import { TSmartSelectionColumnLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { areGapsUniform } from './areGapsUniform';
import { buildAlignedSequenceCandidate } from './buildAlignedSequenceCandidate';
import { buildVerticalGap } from './buildVerticalGap';

export const getVerticalLayout = (nodes: TSmartSelectionNode[], toleranceWorldUnits: number): TSmartSelectionColumnLayout | null => {
  const candidate = buildAlignedSequenceCandidate(nodes, 'y');

  if (candidate && areGapsUniform(candidate.gapValues, toleranceWorldUnits)) {
    return {
      gaps: candidate.gapValues.map((value, index) => buildVerticalGap(candidate.sorted[index], candidate.sorted[index + 1], index, value)),
      nodes: candidate.sorted,
      type: 'column',
    };
  }

  return null;
};
