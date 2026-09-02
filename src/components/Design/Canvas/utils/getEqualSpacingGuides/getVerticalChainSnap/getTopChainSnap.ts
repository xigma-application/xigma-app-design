// types
import { TEdges } from '../../getDistanceGuides/types';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from '../types';

// utils
import { findVerticalNeighbors } from '../findVerticalNeighbors';
import { getEdges } from '../../getDistanceGuides/getEdges';
import { getVerticalGuide } from '../../getDistanceGuides/getVerticalGuide';

export type TTopChainSnap = TEqualSpacingGuides & { deltaY: number };

const NO_SNAP: TTopChainSnap = { deltaY: 0, labels: [], lines: [] };

const getBandX = (a: TEdges, b: TEdges): number => (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2;

export const getTopChainSnap = (
  active: TEdges,
  top: TEqualSpacingCandidate,
  candidates: TEqualSpacingCandidate[],
  toleranceWorldUnits: number,
): TTopChainSnap => {
  const topEdges = getEdges(top.bounds);
  const { top: top2 } = findVerticalNeighbors(
    topEdges,
    candidates.filter((candidate) => candidate !== top),
  );

  if (!top2) {
    return NO_SNAP;
  }

  const top2Edges = getEdges(top2.bounds);
  const referenceGap = topEdges.top - top2Edges.bottom;
  const currentGap = active.top - topEdges.bottom;
  const mismatch = currentGap - referenceGap;

  if (referenceGap <= 0 || Math.abs(mismatch) > toleranceWorldUnits) {
    return NO_SNAP;
  }

  const deltaY = -mismatch;
  const snapped: TEdges = { ...active, bottom: active.bottom + deltaY, top: active.top + deltaY };
  const referenceGuide = getVerticalGuide(topEdges, top2Edges, getBandX(topEdges, top2Edges));
  const matchedGuide = getVerticalGuide(snapped, topEdges, getBandX(snapped, topEdges));

  return {
    deltaY,
    labels: [referenceGuide.label, matchedGuide.label],
    lines: [referenceGuide.line, matchedGuide.line],
  };
};
