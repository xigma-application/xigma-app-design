// types
import { TPoint } from 'types/canvas';

export type TShapeSdf = {
  cellSize: number;
  height: number;
  origin: TPoint;
  values: Float32Array;
  width: number;
};
