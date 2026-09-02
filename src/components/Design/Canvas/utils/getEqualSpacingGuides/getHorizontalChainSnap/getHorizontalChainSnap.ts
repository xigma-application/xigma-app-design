// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from '../types';

// utils
import { findHorizontalNeighbors } from '../findHorizontalNeighbors';
import { getLeftChainSnap } from './getLeftChainSnap';
import { getRightChainSnap } from './getRightChainSnap';

export type THorizontalChainSnap = TEqualSpacingGuides & { deltaX: number };

const NO_SNAP: THorizontalChainSnap = { deltaX: 0, labels: [], lines: [] };

export const getHorizontalChainSnap = (
  active: TEdges,
  candidates: TEqualSpacingCandidate[],
  toleranceWorldUnits: number,
): THorizontalChainSnap => {
  const { left, right } = findHorizontalNeighbors(active, candidates);
  const leftSnap = left && getLeftChainSnap(active, left, candidates, toleranceWorldUnits);

  if (leftSnap && leftSnap.lines.length > 0) {
    return leftSnap;
  }

  const rightSnap = right && getRightChainSnap(active, right, candidates, toleranceWorldUnits);

  if (rightSnap && rightSnap.lines.length > 0) {
    return rightSnap;
  }

  return NO_SNAP;
};
