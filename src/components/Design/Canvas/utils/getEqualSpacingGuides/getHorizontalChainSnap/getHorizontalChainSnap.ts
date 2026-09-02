// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from '../types';

// utils
import { findHorizontalNeighbors } from '../findHorizontalNeighbors';
import { getFlankedChainSnap } from './getFlankedChainSnap';
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
  const flankedSnap = left && right ? getFlankedChainSnap(active, left, right, toleranceWorldUnits) : NO_SNAP;
  const leftSnap = left ? getLeftChainSnap(active, left, candidates, toleranceWorldUnits) : NO_SNAP;
  const rightSnap = right ? getRightChainSnap(active, right, candidates, toleranceWorldUnits) : NO_SNAP;

  switch (true) {
    case flankedSnap.lines.length > 0:
      return flankedSnap;
    case leftSnap.lines.length > 0:
      return leftSnap;
    case rightSnap.lines.length > 0:
      return rightSnap;
    default:
      return NO_SNAP;
  }
};
