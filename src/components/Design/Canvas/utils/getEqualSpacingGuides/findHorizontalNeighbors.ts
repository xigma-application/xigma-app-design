// types
import { TEdges } from '../getDistanceGuides/types';
import { TEqualSpacingCandidate } from './types';

// utils
import { getEdges } from '../getDistanceGuides/getEdges';
import { getOverlap } from '../getDistanceGuides/getOverlap';

export type THorizontalNeighbors = { left: TEdges | null; right: TEdges | null };

export const findHorizontalNeighbors = (active: TEdges, candidates: TEqualSpacingCandidate[]): THorizontalNeighbors => {
  let left: TEdges | null = null;
  let right: TEdges | null = null;

  candidates.forEach((candidate) => {
    const edges = getEdges(candidate.bounds);

    if (getOverlap(active.top, active.bottom, edges.top, edges.bottom) <= 0) {
      return;
    }

    if (edges.right <= active.left && (!left || edges.right > left.right)) {
      left = edges;
    }

    if (edges.left >= active.right && (!right || edges.left < right.left)) {
      right = edges;
    }
  });

  return { left, right };
};
