// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from '../types';

// utils
import { findVerticalNeighbors } from '../findVerticalNeighbors';
import { getEdges } from '../../getDistanceGuides/getEdges';
import { getVerticalGuide } from '../../getDistanceGuides/getVerticalGuide';

export type TBottomChainSnap = TEqualSpacingGuides & { deltaY: number };

const NO_SNAP: TBottomChainSnap = { deltaY: 0, labels: [], lines: [] };

const getBandX = (a: TEdges, b: TEdges): number => (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2;

export const getBottomChainSnap = (
  active: TEdges,
  bottom: TEqualSpacingCandidate,
  candidates: TEqualSpacingCandidate[],
  toleranceWorldUnits: number,
): TBottomChainSnap => {
  const bottomEdges = getEdges(bottom.bounds);
  const { bottom: bottom2 } = findVerticalNeighbors(
    bottomEdges,
    candidates.filter((candidate) => candidate !== bottom),
  );

  if (!bottom2) {
    return NO_SNAP;
  }

  const bottom2Edges = getEdges(bottom2.bounds);
  const referenceGap = bottom2Edges.top - bottomEdges.bottom;
  const currentGap = bottomEdges.top - active.bottom;
  const mismatch = currentGap - referenceGap;

  if (referenceGap <= 0 || Math.abs(mismatch) > toleranceWorldUnits) {
    return NO_SNAP;
  }

  const deltaY = mismatch;
  const snapped: TEdges = { ...active, bottom: active.bottom + deltaY, top: active.top + deltaY };
  const referenceGuide = getVerticalGuide(bottomEdges, bottom2Edges, getBandX(bottomEdges, bottom2Edges));
  const matchedGuide = getVerticalGuide(snapped, bottomEdges, getBandX(snapped, bottomEdges));

  return {
    deltaY,
    labels: [referenceGuide.label, matchedGuide.label],
    lines: [referenceGuide.line, matchedGuide.line],
  };
};
