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
  /** arc-lengths of every sharp tangent-discontinuity along the path (vector chain vertices); empty for a smooth path like an ellipse */
  cornerLengths: number[];
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
