// others
import { GRID_CELL_SIZE_MATCH_TOLERANCE_PX } from 'constant/canvas';

// types
import { TEdges } from '../getDistanceGuides/types';
import { TEqualSpacingCandidate } from './types';

// utils
import { getEdges } from '../getDistanceGuides/getEdges';

// a "column" of a grid — candidates only count as column-mates of `active` if they share its exact
// width (within a tight tolerance); a plain, non-grid chain/flanked match has no such requirement
export const filterColumnCandidates = (active: TEdges, candidates: TEqualSpacingCandidate[]): TEqualSpacingCandidate[] => {
  const activeWidth = active.right - active.left;

  return candidates.filter((candidate) => {
    const edges = getEdges(candidate.bounds);

    return Math.abs(edges.right - edges.left - activeWidth) <= GRID_CELL_SIZE_MATCH_TOLERANCE_PX;
  });
};
