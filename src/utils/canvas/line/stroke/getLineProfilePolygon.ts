// types
import { StrokeProfile } from 'types/design/enums';
import { TLineFrame } from '../types';
import { TPoint } from 'types/canvas';

// utils
import { getLineFramePoint } from './getLineFramePoint';
import { getStrokeProfileWidthMultiplier } from 'utils/design/stroke/getStrokeProfileWidthMultiplier';

const PROFILE_SAMPLES = 64;

export const getLineProfilePolygon = (frame: TLineFrame, profile: StrokeProfile, flipped: boolean): TPoint[] => {
  const samples = Array.from({ length: PROFILE_SAMPLES + 1 }, (_, index) => index / PROFILE_SAMPLES);
  const widths = samples.map((t) => frame.halfWidth * getStrokeProfileWidthMultiplier(profile, t, flipped));

  return [
    ...samples.map((t, index) => getLineFramePoint(frame, t * frame.length, widths[index])),
    ...samples.map((t, index) => getLineFramePoint(frame, t * frame.length, -widths[index])).reverse(),
  ];
};
