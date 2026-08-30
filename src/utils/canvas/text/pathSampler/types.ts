// types
import { TPoint } from 'types/canvas';

export type TPathSample = TPoint & {
  angleDegrees: number;
};

export type TNearestPathOffset = {
  distance: number;
  offset: number;
  point: TPoint;
};

export type TTextPathSampler = {
  isClosed: boolean;
  nearestOffsetAtPoint: (worldPoint: TPoint) => TNearestPathOffset;
  sampleAtLength: (length: number) => TPathSample;
  totalLength: number;
};

export type TTextPathBox = {
  height: number;
  rotation: number;
  width: number;
  x: number;
  y: number;
};
