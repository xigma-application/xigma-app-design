// types
import { TAxisEdges, getAxisEdges } from './getAxisEdges';
import { TEdges } from '../../../getDistanceGuides/types';
import { TEqualSpacingCandidate } from '../../types';
import { TMatchedChainAxis } from './types';

// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';

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
      const sameSize =
        Math.abs(metrics.length - activeMetrics.length) <= sizeToleranceWorldUnits &&
        Math.abs(metrics.breadth - activeMetrics.breadth) <= sizeToleranceWorldUnits;
      const centred = Math.abs(metrics.centre - activeMetrics.centre) <= centreToleranceWorldUnits;
      const distance = sign === -1 ? cursorMetrics.near - metrics.far : metrics.near - cursorMetrics.far;

      if (sameSize && centred && distance > 0 && distance < pickedDistance) {
        picked = { candidate, edges };
        pickedDistance = distance;
      }
    }
  }

  return picked;
};
