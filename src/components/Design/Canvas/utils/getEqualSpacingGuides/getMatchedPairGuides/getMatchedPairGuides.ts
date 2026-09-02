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

  if (vertical.lines.length > 0) {
    return vertical;
  }

  return getHorizontalMatchedPair(active, candidates, sizeToleranceWorldUnits, centreToleranceWorldUnits);
};
