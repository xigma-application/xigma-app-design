// others
import { GRID_CELL_SIZE_MATCH_TOLERANCE_PX } from 'constant/canvas';

// types
import { TEdges } from '../getDistanceGuides/types';
import { TEqualSpacingCandidate } from './types';

// utils
import { getEdges } from '../getDistanceGuides/getEdges';

// a "row" of a grid — candidates only count as row-mates of `active` if they share its exact height
// (within a tight tolerance); a plain, non-grid chain/flanked match has no such requirement
export const filterRowCandidates = (active: TEdges, candidates: TEqualSpacingCandidate[]): TEqualSpacingCandidate[] => {
  const activeHeight = active.bottom - active.top;

  return candidates.filter((candidate) => {
    const edges = getEdges(candidate.bounds);

    return Math.abs(edges.bottom - edges.top - activeHeight) <= GRID_CELL_SIZE_MATCH_TOLERANCE_PX;
  });
};
