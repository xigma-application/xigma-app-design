// types
import { StrokeBrushDirection, StrokeProfile } from 'types/design/enums';
import { TBrushScatterStats } from 'utils/brushes/types';

export type TScatterBrushOptions = {
  angularJitter: number;
  direction: StrokeBrushDirection;
  flipped: boolean;
  gap: number;
  index: number;
  profile: StrokeProfile;
  rotation: number;
  seed: string;
  sizeJitter: number;
  stats?: TBrushScatterStats;
  strokeWidth: number;
  wiggle: number;
};

export type TScatterDot = { radius: number; x: number; y: number };

export type TScatterLayout = { dotsPerStamp: number; pitch: number; stampCount: number };
