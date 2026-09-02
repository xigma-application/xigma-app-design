// types
import { TDraftRect } from 'types/canvas';
import { TEqualSpacingCandidate, TEqualSpacingGuides } from './types';

// utils
import { findHorizontalNeighbors } from './findHorizontalNeighbors';
import { findVerticalNeighbors } from './findVerticalNeighbors';
import { getEdges } from '../getDistanceGuides/getEdges';
import { getHorizontalEqualSpacingGuide } from './getHorizontalEqualSpacingGuide';
import { getVerticalEqualSpacingGuide } from './getVerticalEqualSpacingGuide';

export const getEqualSpacingGuides = (activeRect: TDraftRect, candidates: TEqualSpacingCandidate[]): TEqualSpacingGuides => {
  const active = getEdges(activeRect);
  const horizontal = getHorizontalEqualSpacingGuide(active, findHorizontalNeighbors(active, candidates));
  const vertical = getVerticalEqualSpacingGuide(active, findVerticalNeighbors(active, candidates));

  return {
    labels: [...horizontal.labels, ...vertical.labels],
    lines: [...horizontal.lines, ...vertical.lines],
  };
};
