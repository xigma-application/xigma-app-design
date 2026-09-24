// types
import { TAxisEdges, getAxisEdges } from './getAxisEdges';
import { TEqualSpacingCandidate } from '../../types';
import { TMatchedChainAxis } from './types';

// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { isChainCandidateMatch } from './isChainCandidateMatch';

export const getMatchingChainCandidates = (
  candidates: TEqualSpacingCandidate[],
  activeMetrics: TAxisEdges,
  axis: TMatchedChainAxis,
  sizeToleranceWorldUnits: number,
  centreToleranceWorldUnits: number,
): TEqualSpacingCandidate[] =>
  candidates.filter((candidate) =>
    isChainCandidateMatch(
      getAxisEdges(getEdges(candidate.bounds), axis),
      activeMetrics,
      sizeToleranceWorldUnits,
      centreToleranceWorldUnits,
    ),
  );
