// types
import { TEdges } from '../getDistanceGuides/types';
import { TEqualSpacingCandidate } from './types';

// utils
import { getEdges } from '../getDistanceGuides/getEdges';
import { getOverlap } from '../getDistanceGuides/getOverlap';

export type TVerticalNeighbors = { bottom: TEqualSpacingCandidate | null; top: TEqualSpacingCandidate | null };

export const findVerticalNeighbors = (active: TEdges, candidates: TEqualSpacingCandidate[]): TVerticalNeighbors => {
  let top: TEqualSpacingCandidate | null = null;
  let topEdges: TEdges | null = null;
  let bottom: TEqualSpacingCandidate | null = null;
  let bottomEdges: TEdges | null = null;

  candidates.forEach((candidate) => {
    const edges = getEdges(candidate.bounds);

    if (getOverlap(active.left, active.right, edges.left, edges.right) <= 0) {
      return;
    }

    if (edges.bottom <= active.top && (!topEdges || edges.bottom > topEdges.bottom)) {
      top = candidate;
      topEdges = edges;
    }

    if (edges.top >= active.bottom && (!bottomEdges || edges.top < bottomEdges.top)) {
      bottom = candidate;
      bottomEdges = edges;
    }
  });

  return { bottom, top };
};
