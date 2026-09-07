// types
import { TPoint } from 'types/canvas';

export type TDimensionHintField = 'height' | 'maxHeight' | 'maxWidth' | 'minHeight' | 'minWidth' | 'width';

export type TDimensionHintColor = 'blue' | 'red';

export type TDimensionHintLine = {
  arrowAtEnd?: boolean;
  color: TDimensionHintColor;
  dashed?: boolean;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export type TDimensionHintLabel = {
  anchor: TPoint;
  color: TDimensionHintColor;
  offsetDirection: TPoint;
  text: string;
};

export type TDimensionHintGuides = {
  labels: TDimensionHintLabel[];
  lines: TDimensionHintLine[];
};

export type TDimensionHintFrame = {
  height: number;
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  rotation?: number;
  width: number;
  x: number;
  y: number;
};
