// types
import { TEdges } from '../getDistanceGuides/types';
import { TEqualSpacingGuides } from './types';
import { TVerticalNeighbors } from './findVerticalNeighbors';

// utils
import { getVerticalGuide } from '../getDistanceGuides/getVerticalGuide';

export type TVerticalEqualSpacingSnap = TEqualSpacingGuides & { deltaY: number };

const NO_SNAP: TVerticalEqualSpacingSnap = { deltaY: 0, labels: [], lines: [] };

const getBandX = (active: TEdges, target: TEdges): number =>
  (Math.max(active.left, target.left) + Math.min(active.right, target.right)) / 2;

export const getVerticalEqualSpacingSnap = (
  active: TEdges,
  neighbors: TVerticalNeighbors,
  toleranceWorldUnits: number,
): TVerticalEqualSpacingSnap => {
  const { bottom, top } = neighbors;

  if (!top || !bottom) {
    return NO_SNAP;
  }

  const idealGap = (bottom.top - top.bottom - (active.bottom - active.top)) / 2;

  if (idealGap <= 0) {
    return NO_SNAP;
  }

  const mismatch = active.top - (top.bottom + idealGap);

  if (Math.abs(mismatch) > toleranceWorldUnits) {
    return NO_SNAP;
  }

  const deltaY = -mismatch;
  const snapped: TEdges = { bottom: active.bottom + deltaY, left: active.left, right: active.right, top: active.top + deltaY };
  const topGuide = getVerticalGuide(snapped, top, getBandX(snapped, top));
  const bottomGuide = getVerticalGuide(snapped, bottom, getBandX(snapped, bottom));

  return { deltaY, labels: [topGuide.label, bottomGuide.label], lines: [topGuide.line, bottomGuide.line] };
};
