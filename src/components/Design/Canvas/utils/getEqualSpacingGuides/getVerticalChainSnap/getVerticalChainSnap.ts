// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from '../types';

// utils
import { findVerticalNeighbors } from '../findVerticalNeighbors';
import { getBottomChainSnap } from './getBottomChainSnap';
import { getTopChainSnap } from './getTopChainSnap';

export type TVerticalChainSnap = TEqualSpacingGuides & { deltaY: number };

const NO_SNAP: TVerticalChainSnap = { deltaY: 0, labels: [], lines: [] };

// mirrors getHorizontalChainSnap.ts on the vertical axis — top is tried before bottom; a real drag
// rarely matches both at once
export const getVerticalChainSnap = (
  active: TEdges,
  candidates: TEqualSpacingCandidate[],
  toleranceWorldUnits: number,
): TVerticalChainSnap => {
  const { bottom, top } = findVerticalNeighbors(active, candidates);
  const topSnap = top && getTopChainSnap(active, top, candidates, toleranceWorldUnits);

  if (topSnap && topSnap.lines.length > 0) {
    return topSnap;
  }

  const bottomSnap = bottom && getBottomChainSnap(active, bottom, candidates, toleranceWorldUnits);

  if (bottomSnap && bottomSnap.lines.length > 0) {
    return bottomSnap;
  }

  return NO_SNAP;
};
