// types
import { StrokeProfile } from 'types/design/enums';

// utils
import { getMirroredTaperWidthMultiplier } from './getMirroredTaperWidthMultiplier';
import { getQuarterTaperWidthMultiplier } from './getQuarterTaperWidthMultiplier';
import { getTaperWidthMultiplier } from './getTaperWidthMultiplier';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const smoothstep = (value: number): number => {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
};

export const getStrokeProfileWidthMultiplier = (profile: StrokeProfile, loopPosition: number, flipped: boolean): number => {
  const position = flipped ? 1 - loopPosition : loopPosition;

  switch (profile) {
    case StrokeProfile.wedge:
      return 1 - position;
    case StrokeProfile.taper:
      return getTaperWidthMultiplier(loopPosition, flipped);
    case StrokeProfile.quarterTaper:
      return getQuarterTaperWidthMultiplier(loopPosition, flipped);
    case StrokeProfile.eye:
      return smoothstep(Math.min(position, 1 - position) * 2);
    case StrokeProfile.mirroredTaper:
      return getMirroredTaperWidthMultiplier(position);
    default:
      return 1;
  }
};
