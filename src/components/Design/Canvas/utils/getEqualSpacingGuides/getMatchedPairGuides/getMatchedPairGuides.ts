// types
import { TDraftRect } from 'types/canvas';
import { TEqualSpacingCandidate, TMatchedPairGuides } from '../types';

// utils
import { getEdges } from '../../getDistanceGuides/getEdges';
import { getHorizontalMatchedPair } from './getHorizontalMatchedPair';
import { getVerticalMatchedPair } from './getVerticalMatchedPair';

export const getMatchedPairGuides = (
  activeRect: TDraftRect,
  candidates: TEqualSpacingCandidate[],
  sizeToleranceWorldUnits: number,
  centreToleranceWorldUnits: number,
): TMatchedPairGuides => {
  const active = getEdges(activeRect);
  const vertical = getVerticalMatchedPair(active, candidates, sizeToleranceWorldUnits, centreToleranceWorldUnits);
  const horizontal = getHorizontalMatchedPair(active, candidates, sizeToleranceWorldUnits, centreToleranceWorldUnits);

  // a shape sitting at the crossing of a vertical AND a horizontal chain gets both sets of guides
  return {
    labels: [...vertical.labels, ...horizontal.labels],
    lines: [...vertical.lines, ...horizontal.lines],
    markers: [...vertical.markers, ...horizontal.markers],
  };
};
