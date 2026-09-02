// types
import { TDistanceGuideLabel, TDistanceGuideLine } from '../getDistanceGuides/types';
import { TDraftRect, TPoint } from 'types/canvas';

export type TEqualSpacingCandidate = {
  bounds: TDraftRect;
};

export type TEqualSpacingGuides = {
  labels: TDistanceGuideLabel[];
  lines: TDistanceGuideLine[];
};

export type TMatchedPairGuides = {
  labels: TDistanceGuideLabel[];
  lines: TDistanceGuideLine[];
  markers: TPoint[];
};
