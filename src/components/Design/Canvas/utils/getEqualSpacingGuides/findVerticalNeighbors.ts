// types
import { TEdges } from '../getDistanceGuides/types';
import { TEqualSpacingCandidate } from './types';

// utils
import { getEdges } from '../getDistanceGuides/getEdges';
import { getOverlap } from '../getDistanceGuides/getOverlap';

export type TVerticalNeighbors = { bottom: TEqualSpacingCandidate | null; top: TEqualSpacingCandidate | null };

// `toleranceWorldUnits` lets a candidate register even if `active`'s raw (pre-snap) position overlaps
// it by up to that amount on the parallel axis — see findHorizontalNeighbors.ts's comment for why.
export const findVerticalNeighbors = (
  active: TEdges,
  candidates: TEqualSpacingCandidate[],
  toleranceWorldUnits: number,
): TVerticalNeighbors => {
  let top: TEqualSpacingCandidate | null = null;
  let topEdges: TEdges | null = null;
  let bottom: TEqualSpacingCandidate | null = null;
  let bottomEdges: TEdges | null = null;

  candidates.forEach((candidate) => {
    const edges = getEdges(candidate.bounds);

    if (getOverlap(active.left, active.right, edges.left, edges.right) <= 0) {
      return;
    }

    if (edges.bottom <= active.top + toleranceWorldUnits && (!topEdges || edges.bottom > topEdges.bottom)) {
      top = candidate;
      topEdges = edges;
    }

    if (edges.top >= active.bottom - toleranceWorldUnits && (!bottomEdges || edges.top < bottomEdges.top)) {
      bottom = candidate;
      bottomEdges = edges;
    }
  });

  return { bottom, top };
};
