// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';
import { TGridAppendCandidate } from './types';

// utils
import { detectGridLayout } from '../getSmartSelectionLayout/detectGridLayout';

export const findGridAppendCandidates = (
  bounds: TSmartSelectionNode[],
  alignmentTolerance: number,
  gapTolerance: number,
): TGridAppendCandidate[] => {
  const candidates: TGridAppendCandidate[] = [];

  bounds.forEach((outlier) => {
    const remainder = bounds.filter((node) => node.id !== outlier.id);
    const layout = detectGridLayout(remainder, alignmentTolerance, gapTolerance);

    if (layout) {
      candidates.push({ layout, outlierId: outlier.id });
    }
  });

  return candidates;
};
