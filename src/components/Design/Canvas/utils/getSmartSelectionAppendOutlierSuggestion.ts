// types
import {
  TSmartSelectionAppendSuggestion,
  TSmartSelectionColumnLayout,
  TSmartSelectionNode,
  TSmartSelectionRowLayout,
} from 'types/design/smartSelection/types';

// utils
import { getHorizontalLayout } from './getSmartSelectionLayout/getHorizontalLayout';
import { getVerticalLayout } from './getSmartSelectionLayout/getVerticalLayout';

type TAppendCandidate = { axis: 'x' | 'y'; layout: TSmartSelectionColumnLayout | TSmartSelectionRowLayout; outlierId: string };

const findAppendCandidates = (bounds: TSmartSelectionNode[], gapTolerance: number): TAppendCandidate[] => {
  const candidates: TAppendCandidate[] = [];

  bounds.forEach((outlier) => {
    const remainder = bounds.filter((node) => node.id !== outlier.id);

    if (remainder.length >= 2) {
      const rowLayout = getHorizontalLayout(remainder, gapTolerance);
      const columnLayout = getVerticalLayout(remainder, gapTolerance);

      if (rowLayout) {
        candidates.push({ axis: 'x', layout: rowLayout, outlierId: outlier.id });
      }

      if (columnLayout) {
        candidates.push({ axis: 'y', layout: columnLayout, outlierId: outlier.id });
      }
    }
  });

  return candidates;
};

const pickInsertSide = (
  outlier: TSmartSelectionNode,
  layout: TSmartSelectionColumnLayout | TSmartSelectionRowLayout,
  axis: 'x' | 'y',
): 'end' | 'start' => {
  const sizeKey = axis === 'x' ? 'width' : 'height';
  const first = layout.nodes[0];
  const last = layout.nodes[layout.nodes.length - 1];
  const outlierCenter = outlier.bounds[axis] + outlier.bounds[sizeKey] / 2;
  const firstCenter = first.bounds[axis] + first.bounds[sizeKey] / 2;
  const lastCenter = last.bounds[axis] + last.bounds[sizeKey] / 2;

  return Math.abs(outlierCenter - firstCenter) <= Math.abs(outlierCenter - lastCenter) ? 'start' : 'end';
};

export const getSmartSelectionAppendOutlierSuggestion = (
  bounds: TSmartSelectionNode[],
  gapTolerance: number,
): TSmartSelectionAppendSuggestion | null => {
  const chosen = findAppendCandidates(bounds, gapTolerance).sort((a, b) => a.outlierId.localeCompare(b.outlierId))[0];
  const outlier = chosen ? bounds.find((node) => node.id === chosen.outlierId) : undefined;

  if (chosen && outlier) {
    return {
      axis: chosen.axis,
      insertAt: pickInsertSide(outlier, chosen.layout, chosen.axis),
      layout: chosen.layout,
      outlierId: chosen.outlierId,
      type: 'append',
    };
  }

  return null;
};
