// types
import { TDistanceGuideLabel, TDistanceGuideLine } from '../getDistanceGuides/types';
import { TDraftRect } from 'types/canvas';

export type TEqualSpacingGuides = {
  labels: TDistanceGuideLabel[];
  lines: TDistanceGuideLine[];
};

export type TEqualSpacingCandidate = {
  bounds: TDraftRect;
};
