// types
import { TDistanceGuideLabel, TDistanceGuideLine } from '../getDistanceGuides/types';
import { TDraftRect } from 'types/canvas';

export type TEqualSpacingCandidate = {
  bounds: TDraftRect;
};

export type TEqualSpacingGuides = {
  labels: TDistanceGuideLabel[];
  lines: TDistanceGuideLine[];
};
