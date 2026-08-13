export type TDraftRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type TEditingTextBox = TDraftRect & {
  flipX: boolean;
  flipY: boolean;
  rotation: number;
};

export type TPoint = {
  x: number;
  y: number;
};

export type TLineSegment = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export type TResizeHandle = 'e' | 'n' | 'ne' | 'nw' | 's' | 'se' | 'sw' | 'w';
