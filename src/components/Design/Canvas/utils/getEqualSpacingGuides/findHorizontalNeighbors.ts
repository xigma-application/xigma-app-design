// types
import { TEdges } from '../getDistanceGuides/types';
import { TEqualSpacingCandidate } from './types';

// utils
import { getEdges } from '../getDistanceGuides/getEdges';
import { getOverlap } from '../getDistanceGuides/getOverlap';

export type THorizontalNeighbors = { left: TEqualSpacingCandidate | null; right: TEqualSpacingCandidate | null };

export const findHorizontalNeighbors = (active: TEdges, candidates: TEqualSpacingCandidate[]): THorizontalNeighbors => {
  let left: TEqualSpacingCandidate | null = null;
  let leftEdges: TEdges | null = null;
  let right: TEqualSpacingCandidate | null = null;
  let rightEdges: TEdges | null = null;

  candidates.forEach((candidate) => {
    const edges = getEdges(candidate.bounds);

    if (getOverlap(active.top, active.bottom, edges.top, edges.bottom) <= 0) {
      return;
    }

    if (edges.right <= active.left && (!leftEdges || edges.right > leftEdges.right)) {
      left = candidate;
      leftEdges = edges;
    }

    if (edges.left >= active.right && (!rightEdges || edges.left < rightEdges.left)) {
      right = candidate;
      rightEdges = edges;
    }
  });

  return { left, right };
};
