// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TMatchedPairGuides } from '../types';

// utils
import { buildMatchedChainGuides } from './buildMatchedChainGuides/buildMatchedChainGuides';
import { walkMatchedChain } from './walkMatchedChain/walkMatchedChain';

const NO_MATCH: TMatchedPairGuides = { labels: [], lines: [], markers: [] };

export const getVerticalMatchedPair = (
  active: TEdges,
  candidates: TEqualSpacingCandidate[],
  sizeToleranceWorldUnits: number,
  centreToleranceWorldUnits: number,
): TMatchedPairGuides => {
  const used = new Set<TEqualSpacingCandidate>();
  const above = walkMatchedChain(active, candidates, used, 'vertical', -1, sizeToleranceWorldUnits, centreToleranceWorldUnits);
  const below = walkMatchedChain(active, candidates, used, 'vertical', 1, sizeToleranceWorldUnits, centreToleranceWorldUnits);

  if (above.length === 0 && below.length === 0) {
    return NO_MATCH;
  }

  const chain = [...above.slice().reverse(), active, ...below];

  return buildMatchedChainGuides(active, chain, 'vertical', sizeToleranceWorldUnits);
};
