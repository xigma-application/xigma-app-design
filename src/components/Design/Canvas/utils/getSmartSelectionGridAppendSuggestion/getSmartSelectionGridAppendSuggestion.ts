// types
import { TSmartSelectionGridAppendSuggestion, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { findGridAppendCandidates } from './findGridAppendCandidates';
import { resolveTarget } from './resolveTarget';

export const getSmartSelectionGridAppendSuggestion = (
  bounds: TSmartSelectionNode[],
  alignmentTolerance: number,
  gapTolerance: number,
): TSmartSelectionGridAppendSuggestion | null => {
  const candidates = findGridAppendCandidates(bounds, alignmentTolerance, gapTolerance).sort((a, b) =>
    a.outlierId.localeCompare(b.outlierId),
  );

  for (const candidate of candidates) {
    const outlier = bounds.find((node) => node.id === candidate.outlierId);
    /* v8 ignore next -- candidate.outlierId always comes from findGridAppendCandidates, which only ever
       picks it out of `bounds` itself, so it always resolves back to a node here */
    const target = outlier ? resolveTarget(outlier, candidate.layout) : null;

    if (target) {
      return { layout: candidate.layout, outlierId: candidate.outlierId, target, type: 'grid-append' };
    }
  }

  return null;
};
