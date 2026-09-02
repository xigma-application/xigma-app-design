// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from '../types';

// utils
import { getEdges } from '../../getDistanceGuides/getEdges';
import { getHorizontalGuide } from '../../getDistanceGuides/getHorizontalGuide';

export type TFlankedChainSnap = TEqualSpacingGuides & { deltaX: number };

const NO_SNAP: TFlankedChainSnap = { deltaX: 0, labels: [], lines: [] };

const getBandY = (a: TEdges, b: TEdges): number => (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2;

export const getFlankedChainSnap = (
  active: TEdges,
  left: TEqualSpacingCandidate,
  right: TEqualSpacingCandidate,
  toleranceWorldUnits: number,
): TFlankedChainSnap => {
  const leftEdges = getEdges(left.bounds);
  const rightEdges = getEdges(right.bounds);
  const idealGap = (rightEdges.left - leftEdges.right - (active.right - active.left)) / 2;

  if (idealGap > 0) {
    const targetLeft = leftEdges.right + idealGap;
    const mismatch = active.left - targetLeft;

    if (Math.abs(mismatch) < toleranceWorldUnits) {
      const deltaX = -mismatch;
      const snapped: TEdges = { ...active, left: active.left + deltaX, right: active.right + deltaX };
      const leftGuide = getHorizontalGuide(snapped, leftEdges, getBandY(snapped, leftEdges));
      const rightGuide = getHorizontalGuide(snapped, rightEdges, getBandY(snapped, rightEdges));

      return {
        deltaX,
        labels: [leftGuide.label, rightGuide.label],
        lines: [leftGuide.line, rightGuide.line],
      };
    }
  }

  return NO_SNAP;
};
