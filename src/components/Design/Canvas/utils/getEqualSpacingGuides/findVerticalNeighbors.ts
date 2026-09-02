// types
import { TEdges } from '../getDistanceGuides/types';
import { TEqualSpacingCandidate } from './types';

// utils
import { getEdges } from '../getDistanceGuides/getEdges';
import { getOverlap } from '../getDistanceGuides/getOverlap';

export type TVerticalNeighbors = { bottom: TEdges | null; top: TEdges | null };

export const findVerticalNeighbors = (active: TEdges, candidates: TEqualSpacingCandidate[]): TVerticalNeighbors => {
  let top: TEdges | null = null;
  let bottom: TEdges | null = null;

  candidates.forEach((candidate) => {
    const edges = getEdges(candidate.bounds);

    if (getOverlap(active.left, active.right, edges.left, edges.right) <= 0) {
      return;
    }

    if (edges.bottom <= active.top && (!top || edges.bottom > top.bottom)) {
      top = edges;
    }

    if (edges.top >= active.bottom && (!bottom || edges.top < bottom.top)) {
      bottom = edges;
    }
  });

  return { bottom, top };
};
