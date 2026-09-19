// types
import { StrokeBrushDirection, StrokeProfile } from 'types/design/enums';

export type TStretchBrushOptions = {
  direction: StrokeBrushDirection;
  flipped: boolean;
  index: number;
  profile: StrokeProfile;
  seed: string;
  strokeWidth: number;
};

export type TStretchOctave = { amplitude: number; smoothen: number; stepped: boolean; values: number[]; wavelength: number };
export type TStretchMultiplier = (distance: number) => number;
