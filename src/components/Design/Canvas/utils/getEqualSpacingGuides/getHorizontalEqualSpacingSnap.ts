// types
import { TEdges } from '../getDistanceGuides/types';
import { TEqualSpacingGuides } from './types';
import { THorizontalNeighbors } from './findHorizontalNeighbors';

// utils
import { getHorizontalGuide } from '../getDistanceGuides/getHorizontalGuide';

export type THorizontalEqualSpacingSnap = TEqualSpacingGuides & { deltaX: number };

const NO_SNAP: THorizontalEqualSpacingSnap = { deltaX: 0, labels: [], lines: [] };

const getBandY = (active: TEdges, target: TEdges): number =>
  (Math.max(active.top, target.top) + Math.min(active.bottom, target.bottom)) / 2;

export const getHorizontalEqualSpacingSnap = (
  active: TEdges,
  neighbors: THorizontalNeighbors,
  toleranceWorldUnits: number,
): THorizontalEqualSpacingSnap => {
  const { left, right } = neighbors;

  if (!left || !right) {
    return NO_SNAP;
  }

  const idealGap = (right.left - left.right - (active.right - active.left)) / 2;

  if (idealGap <= 0) {
    return NO_SNAP;
  }

  const mismatch = active.left - (left.right + idealGap);

  if (Math.abs(mismatch) > toleranceWorldUnits) {
    return NO_SNAP;
  }

  const deltaX = -mismatch;
  const snapped: TEdges = { bottom: active.bottom, left: active.left + deltaX, right: active.right + deltaX, top: active.top };
  const leftGuide = getHorizontalGuide(snapped, left, getBandY(snapped, left));
  const rightGuide = getHorizontalGuide(snapped, right, getBandY(snapped, right));

  return { deltaX, labels: [leftGuide.label, rightGuide.label], lines: [leftGuide.line, rightGuide.line] };
};
