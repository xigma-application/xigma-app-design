// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from './types';

// utils
import { getEdges } from '../getDistanceGuides/getEdges';
import { getHorizontalChainSnap } from './getHorizontalChainSnap/getHorizontalChainSnap';
import { getVerticalChainSnap } from './getVerticalChainSnap/getVerticalChainSnap';

export type TChainSnap = { delta: TPoint; guides: TEqualSpacingGuides };

export const getChainSnap = (activeRect: TDraftRect, candidates: TEqualSpacingCandidate[], toleranceWorldUnits: number): TChainSnap => {
  const active = getEdges(activeRect);
  const horizontal = getHorizontalChainSnap(active, candidates, toleranceWorldUnits);
  const vertical = getVerticalChainSnap(active, candidates, toleranceWorldUnits);

  return {
    delta: { x: horizontal.deltaX, y: vertical.deltaY },
    guides: {
      labels: [...horizontal.labels, ...vertical.labels],
      lines: [...horizontal.lines, ...vertical.lines],
    },
  };
};
