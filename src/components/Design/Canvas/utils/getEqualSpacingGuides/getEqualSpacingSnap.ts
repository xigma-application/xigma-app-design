// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from './types';

// utils
import { findHorizontalNeighbors } from './findHorizontalNeighbors';
import { findVerticalNeighbors } from './findVerticalNeighbors';
import { getEdges } from '../getDistanceGuides/getEdges';
import { getHorizontalEqualSpacingSnap } from './getHorizontalEqualSpacingSnap';
import { getVerticalEqualSpacingSnap } from './getVerticalEqualSpacingSnap';

export type TEqualSpacingSnap = { delta: TPoint; guides: TEqualSpacingGuides };

export const getEqualSpacingSnap = (
  activeRect: TDraftRect,
  candidates: TEqualSpacingCandidate[],
  toleranceWorldUnits: number,
): TEqualSpacingSnap => {
  const active = getEdges(activeRect);
  const horizontal = getHorizontalEqualSpacingSnap(active, findHorizontalNeighbors(active, candidates), toleranceWorldUnits);
  const vertical = getVerticalEqualSpacingSnap(active, findVerticalNeighbors(active, candidates), toleranceWorldUnits);

  return {
    delta: { x: horizontal.deltaX, y: vertical.deltaY },
    guides: {
      labels: [...horizontal.labels, ...vertical.labels],
      lines: [...horizontal.lines, ...vertical.lines],
    },
  };
};
