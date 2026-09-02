// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from '../types';

// utils
import { getEdges } from '../../getDistanceGuides/getEdges';
import { getVerticalGuide } from '../../getDistanceGuides/getVerticalGuide';

export type TFlankedChainSnap = TEqualSpacingGuides & { deltaY: number };

const NO_SNAP: TFlankedChainSnap = { deltaY: 0, labels: [], lines: [] };

const getBandX = (a: TEdges, b: TEdges): number => (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2;

export const getFlankedChainSnap = (
  active: TEdges,
  top: TEqualSpacingCandidate,
  bottom: TEqualSpacingCandidate,
  toleranceWorldUnits: number,
): TFlankedChainSnap => {
  const topEdges = getEdges(top.bounds);
  const bottomEdges = getEdges(bottom.bounds);
  const idealGap = (bottomEdges.top - topEdges.bottom - (active.bottom - active.top)) / 2;

  if (idealGap > 0) {
    const targetTop = topEdges.bottom + idealGap;
    const mismatch = active.top - targetTop;

    if (Math.abs(mismatch) < toleranceWorldUnits) {
      const deltaY = -mismatch;
      const snapped: TEdges = { ...active, bottom: active.bottom + deltaY, top: active.top + deltaY };
      const topGuide = getVerticalGuide(snapped, topEdges, getBandX(snapped, topEdges));
      const bottomGuide = getVerticalGuide(snapped, bottomEdges, getBandX(snapped, bottomEdges));

      return {
        deltaY,
        labels: [topGuide.label, bottomGuide.label],
        lines: [topGuide.line, bottomGuide.line],
      };
    }
  }

  return NO_SNAP;
};
