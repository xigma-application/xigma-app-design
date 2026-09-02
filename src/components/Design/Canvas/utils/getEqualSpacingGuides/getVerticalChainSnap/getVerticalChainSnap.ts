// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from '../types';

// utils
import { findVerticalNeighbors } from '../findVerticalNeighbors';
import { getBottomChainSnap } from './getBottomChainSnap';
import { getFlankedChainSnap } from './getFlankedChainSnap';
import { getTopChainSnap } from './getTopChainSnap';

export type TVerticalChainSnap = TEqualSpacingGuides & { deltaY: number };

const NO_SNAP: TVerticalChainSnap = { deltaY: 0, labels: [], lines: [] };

export const getVerticalChainSnap = (
  active: TEdges,
  candidates: TEqualSpacingCandidate[],
  toleranceWorldUnits: number,
): TVerticalChainSnap => {
  const { bottom, top } = findVerticalNeighbors(active, candidates, toleranceWorldUnits);
  const flankedSnap = top && bottom ? getFlankedChainSnap(active, top, bottom, toleranceWorldUnits) : NO_SNAP;
  const topSnap = top ? getTopChainSnap(active, top, candidates, toleranceWorldUnits) : NO_SNAP;
  const bottomSnap = bottom ? getBottomChainSnap(active, bottom, candidates, toleranceWorldUnits) : NO_SNAP;

  switch (true) {
    case flankedSnap.lines.length > 0:
      return flankedSnap;
    case topSnap.lines.length > 0:
      return topSnap;
    case bottomSnap.lines.length > 0:
      return bottomSnap;
    default:
      return NO_SNAP;
  }
};
