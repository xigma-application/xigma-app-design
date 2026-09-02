// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TMatchedPairGuides } from '../types';

// utils
import { buildMatchedChainGuides } from './buildMatchedChainGuides/buildMatchedChainGuides';
import { walkMatchedChain } from './walkMatchedChain/walkMatchedChain';

const NO_MATCH: TMatchedPairGuides = { labels: [], lines: [], markers: [] };

export const getHorizontalMatchedPair = (
  active: TEdges,
  candidates: TEqualSpacingCandidate[],
  sizeToleranceWorldUnits: number,
  centreToleranceWorldUnits: number,
): TMatchedPairGuides => {
  const used = new Set<TEqualSpacingCandidate>();
  const left = walkMatchedChain(active, candidates, used, 'horizontal', -1, sizeToleranceWorldUnits, centreToleranceWorldUnits);
  const right = walkMatchedChain(active, candidates, used, 'horizontal', 1, sizeToleranceWorldUnits, centreToleranceWorldUnits);

  if (left.length === 0 && right.length === 0) {
    return NO_MATCH;
  }

  const chain = [...left.slice().reverse(), active, ...right];

  return buildMatchedChainGuides(active, chain, 'horizontal', sizeToleranceWorldUnits);
};
