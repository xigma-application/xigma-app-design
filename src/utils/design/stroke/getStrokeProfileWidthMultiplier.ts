// types
import { StrokeProfile } from 'types/design/enums';

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
      return 1 - smoothstep(position);
    case StrokeProfile.quarterTaper:
      return position < 0.75 ? 1 : 1 - smoothstep((position - 0.75) / 0.25);
    case StrokeProfile.eye:
      return smoothstep(Math.min(position, 1 - position) * 2);
    case StrokeProfile.mirroredTaper:
      return smoothstep(Math.min(position, 1 - position) / 0.25);
    default:
      return 1;
  }
};
