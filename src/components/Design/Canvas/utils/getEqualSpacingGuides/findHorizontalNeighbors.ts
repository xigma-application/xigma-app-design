// types
import { TEdges } from '../getDistanceGuides/types';
import { TEqualSpacingCandidate } from './types';

// utils
import { getEdges } from '../getDistanceGuides/getEdges';
import { getOverlap } from '../getDistanceGuides/getOverlap';

export type THorizontalNeighbors = { left: TEqualSpacingCandidate | null; right: TEqualSpacingCandidate | null };

// `toleranceWorldUnits` lets a candidate register even if `active`'s raw (pre-snap) position overlaps
// it by up to that amount on the parallel axis — a live drag routinely overshoots a target by a few
// px mid-gesture, and without this a genuinely close candidate would go undetected for that frame
// even though the resulting correction is well within the snap's own tolerance.
export const findHorizontalNeighbors = (
  active: TEdges,
  candidates: TEqualSpacingCandidate[],
  toleranceWorldUnits: number,
): THorizontalNeighbors => {
  let left: TEqualSpacingCandidate | null = null;
  let leftEdges: TEdges | null = null;
  let right: TEqualSpacingCandidate | null = null;
  let rightEdges: TEdges | null = null;

  candidates.forEach((candidate) => {
    const edges = getEdges(candidate.bounds);

    if (getOverlap(active.top, active.bottom, edges.top, edges.bottom) <= 0) {
      return;
    }

    if (edges.right <= active.left + toleranceWorldUnits && (!leftEdges || edges.right > leftEdges.right)) {
      left = candidate;
      leftEdges = edges;
    }

    if (edges.left >= active.right - toleranceWorldUnits && (!rightEdges || edges.left < rightEdges.left)) {
      right = candidate;
      rightEdges = edges;
    }
  });

  return { left, right };
};
