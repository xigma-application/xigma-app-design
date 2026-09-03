// types
import { TSmartSelectionEqualizeSuggestion, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { areGapsUniform } from './getSmartSelectionLayout/areGapsUniform';
import { buildAlignedSequenceCandidate } from './getSmartSelectionLayout/buildAlignedSequenceCandidate';
import { buildHorizontalGap } from './getSmartSelectionLayout/buildHorizontalGap';
import { buildVerticalGap } from './getSmartSelectionLayout/buildVerticalGap';

const buildRowSuggestion = (bounds: TSmartSelectionNode[], gapTolerance: number): TSmartSelectionEqualizeSuggestion | null => {
  const candidate = buildAlignedSequenceCandidate(bounds, 'x');

  if (candidate && candidate.gapValues.length >= 2 && !areGapsUniform(candidate.gapValues, gapTolerance)) {
    return {
      axis: 'x',
      gapValues: candidate.gapValues,
      layout: {
        gaps: candidate.gapValues.map((value, index) =>
          buildHorizontalGap(candidate.sorted[index], candidate.sorted[index + 1], index, value),
        ),
        nodes: candidate.sorted,
        type: 'row',
      },
      type: 'equalize',
    };
  }

  return null;
};

const buildColumnSuggestion = (bounds: TSmartSelectionNode[], gapTolerance: number): TSmartSelectionEqualizeSuggestion | null => {
  const candidate = buildAlignedSequenceCandidate(bounds, 'y');

  if (candidate && candidate.gapValues.length >= 2 && !areGapsUniform(candidate.gapValues, gapTolerance)) {
    return {
      axis: 'y',
      gapValues: candidate.gapValues,
      layout: {
        gaps: candidate.gapValues.map((value, index) =>
          buildVerticalGap(candidate.sorted[index], candidate.sorted[index + 1], index, value),
        ),
        nodes: candidate.sorted,
        type: 'column',
      },
      type: 'equalize',
    };
  }

  return null;
};

export const getSmartSelectionEqualizeSuggestion = (
  bounds: TSmartSelectionNode[],
  gapTolerance: number,
): TSmartSelectionEqualizeSuggestion | null => buildRowSuggestion(bounds, gapTolerance) ?? buildColumnSuggestion(bounds, gapTolerance);
