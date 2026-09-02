// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from '../types';

// utils
import { findHorizontalNeighbors } from '../findHorizontalNeighbors';
import { getEdges } from '../../getDistanceGuides/getEdges';
import { getHorizontalGuide } from '../../getDistanceGuides/getHorizontalGuide';

export type TLeftChainSnap = TEqualSpacingGuides & { deltaX: number };

const NO_SNAP: TLeftChainSnap = { deltaX: 0, labels: [], lines: [] };

const getBandY = (a: TEdges, b: TEdges): number => (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2;

export const getLeftChainSnap = (
  active: TEdges,
  left: TEqualSpacingCandidate,
  candidates: TEqualSpacingCandidate[],
  toleranceWorldUnits: number,
): TLeftChainSnap => {
  const leftEdges = getEdges(left.bounds);
  const { left: left2 } = findHorizontalNeighbors(
    leftEdges,
    candidates.filter((candidate) => candidate !== left),
  );

  if (!left2) {
    return NO_SNAP;
  }

  const left2Edges = getEdges(left2.bounds);
  const referenceGap = leftEdges.left - left2Edges.right;
  const currentGap = active.left - leftEdges.right;
  const mismatch = currentGap - referenceGap;

  if (referenceGap <= 0 || Math.abs(mismatch) > toleranceWorldUnits) {
    return NO_SNAP;
  }

  const deltaX = -mismatch;
  const snapped: TEdges = { ...active, left: active.left + deltaX, right: active.right + deltaX };
  const referenceGuide = getHorizontalGuide(leftEdges, left2Edges, getBandY(leftEdges, left2Edges));
  const matchedGuide = getHorizontalGuide(snapped, leftEdges, getBandY(snapped, leftEdges));

  return {
    deltaX,
    labels: [referenceGuide.label, matchedGuide.label],
    lines: [referenceGuide.line, matchedGuide.line],
  };
};
