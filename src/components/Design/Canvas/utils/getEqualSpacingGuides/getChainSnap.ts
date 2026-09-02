// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from './types';

// utils
import { filterColumnCandidates } from './filterColumnCandidates';
import { filterRowCandidates } from './filterRowCandidates';
import { getEdges } from '../getDistanceGuides/getEdges';
import { getHorizontalChainSnap } from './getHorizontalChainSnap/getHorizontalChainSnap';
import { getVerticalChainSnap } from './getVerticalChainSnap/getVerticalChainSnap';

export type TChainSnap = { delta: TPoint; guides: TEqualSpacingGuides };

// grid gaps: a stricter match tried first per axis — row-mates (same height) for the horizontal
// axis, column-mates (same width) for the vertical axis. Falls back to the plain, size-agnostic
// chain/flanked match (against every candidate) when no grid pattern applies on that axis.
export const getChainSnap = (activeRect: TDraftRect, candidates: TEqualSpacingCandidate[], toleranceWorldUnits: number): TChainSnap => {
  const active = getEdges(activeRect);
  const rowSnap = getHorizontalChainSnap(active, filterRowCandidates(active, candidates), toleranceWorldUnits);
  const horizontal = rowSnap.lines.length > 0 ? rowSnap : getHorizontalChainSnap(active, candidates, toleranceWorldUnits);
  const columnSnap = getVerticalChainSnap(active, filterColumnCandidates(active, candidates), toleranceWorldUnits);
  const vertical = columnSnap.lines.length > 0 ? columnSnap : getVerticalChainSnap(active, candidates, toleranceWorldUnits);

  return {
    delta: { x: horizontal.deltaX, y: vertical.deltaY },
    guides: {
      labels: [...horizontal.labels, ...vertical.labels],
      lines: [...horizontal.lines, ...vertical.lines],
    },
  };
};
