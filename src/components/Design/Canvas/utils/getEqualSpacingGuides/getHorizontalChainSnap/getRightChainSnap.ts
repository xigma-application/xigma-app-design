// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from '../types';

// utils
import { findHorizontalNeighbors } from '../findHorizontalNeighbors';
import { getEdges } from '../../getDistanceGuides/getEdges';
import { getHorizontalGuide } from '../../getDistanceGuides/getHorizontalGuide';

export type TRightChainSnap = TEqualSpacingGuides & { deltaX: number };

const NO_SNAP: TRightChainSnap = { deltaX: 0, labels: [], lines: [] };

const getBandY = (a: TEdges, b: TEdges): number => (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2;

export const getRightChainSnap = (
  active: TEdges,
  right: TEqualSpacingCandidate,
  candidates: TEqualSpacingCandidate[],
  toleranceWorldUnits: number,
): TRightChainSnap => {
  const rightEdges = getEdges(right.bounds);
  const { right: right2 } = findHorizontalNeighbors(
    rightEdges,
    candidates.filter((candidate) => candidate !== right),
    toleranceWorldUnits,
  );

  if (!right2) {
    return NO_SNAP;
  }

  const right2Edges = getEdges(right2.bounds);
  const referenceGap = right2Edges.left - rightEdges.right;
  const currentGap = rightEdges.left - active.right;
  const mismatch = currentGap - referenceGap;

  if (referenceGap <= 0 || Math.abs(mismatch) > toleranceWorldUnits) {
    return NO_SNAP;
  }

  const deltaX = mismatch;
  const snapped: TEdges = { ...active, left: active.left + deltaX, right: active.right + deltaX };
  const referenceGuide = getHorizontalGuide(rightEdges, right2Edges, getBandY(rightEdges, right2Edges));
  const matchedGuide = getHorizontalGuide(snapped, rightEdges, getBandY(snapped, rightEdges));

  return {
    deltaX,
    labels: [referenceGuide.label, matchedGuide.label],
    lines: [referenceGuide.line, matchedGuide.line],
  };
};
