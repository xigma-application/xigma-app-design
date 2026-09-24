// types
import { TAxisEdges, getAxisEdges } from './getAxisEdges';
import { TEdges } from '../../../getDistanceGuides/types';
import { TEqualSpacingCandidate } from '../../types';
import { TMatchedChainAxis } from './types';

// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { isChainCandidateMatch } from './isChainCandidateMatch';

export type TChainLink = {
  candidate: TEqualSpacingCandidate;
  edges: TEdges;
};

export const pickNextChainLink = (
  cursor: TEdges,
  activeMetrics: TAxisEdges,
  candidates: TEqualSpacingCandidate[],
  used: Set<TEqualSpacingCandidate>,
  axis: TMatchedChainAxis,
  sign: -1 | 1,
  sizeToleranceWorldUnits: number,
  centreToleranceWorldUnits: number,
): TChainLink | null => {
  const cursorMetrics = getAxisEdges(cursor, axis);
  let picked: TChainLink | null = null;
  let pickedDistance = Infinity;

  for (const candidate of candidates) {
    if (!used.has(candidate)) {
      const edges = getEdges(candidate.bounds);
      const metrics = getAxisEdges(edges, axis);
      const distance = sign === -1 ? cursorMetrics.near - metrics.far : metrics.near - cursorMetrics.far;

      if (
        isChainCandidateMatch(metrics, activeMetrics, sizeToleranceWorldUnits, centreToleranceWorldUnits) &&
        distance > 0 &&
        distance < pickedDistance
      ) {
        picked = { candidate, edges };
        pickedDistance = distance;
      }
    }
  }

  return picked;
};
