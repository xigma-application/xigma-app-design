// types
import { TEdges } from '../../../getDistanceGuides/types';
import { TEqualSpacingCandidate } from '../../types';
import { TMatchedChainAxis } from './types';

// utils
import { getAxisEdges } from './getAxisEdges';
import { pickNextChainLink } from './pickNextChainLink';

export const walkMatchedChain = (
  active: TEdges,
  candidates: TEqualSpacingCandidate[],
  used: Set<TEqualSpacingCandidate>,
  axis: TMatchedChainAxis,
  sign: -1 | 1,
  sizeToleranceWorldUnits: number,
  centreToleranceWorldUnits: number,
): TEdges[] => {
  const activeMetrics = getAxisEdges(active, axis);
  const run: TEdges[] = [];
  let cursor = active;

  for (;;) {
    const link = pickNextChainLink(cursor, activeMetrics, candidates, used, axis, sign, sizeToleranceWorldUnits, centreToleranceWorldUnits);

    if (!link) {
      return run;
    }

    used.add(link.candidate);
    run.push(link.edges);
    cursor = link.edges;
  }
};
