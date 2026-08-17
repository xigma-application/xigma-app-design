export type TDraftRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type TEditingTextBox = TDraftRect & {
  flipX: boolean;
  flipY: boolean;
  pathFlip?: boolean;
  pathId?: string | null;
  pathStartOffset?: number;
  rotation: number;
};

export type TPoint = {
  x: number;
  y: number;
};

export type TEllipseArcLengthSample = {
  angle: number;
  cumulativeLength: number;
};

export type TEllipsePathSample = TPoint & {
  angleDegrees: number;
};

export type TNearestEllipsePathOffset = {
  distance: number;
  offset: number;
  point: TPoint;
};

export type TLineSegment = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export type TResizeHandle = 'e' | 'n' | 'ne' | 'nw' | 's' | 'se' | 'sw' | 'w';

export type TCornerRadiusHandle = 'ne' | 'nw' | 'se' | 'sw';
