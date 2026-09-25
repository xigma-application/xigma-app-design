// types
import { StrokeAlign } from 'types/design/enums';

export const getStrokeBandDistances = (align: StrokeAlign, strokeWidth: number): [number, number] => {
  switch (align) {
    case StrokeAlign.center:
      return [strokeWidth / 2, strokeWidth / 2];
    case StrokeAlign.outside:
      return [strokeWidth, 0];
    default:
      return [0, strokeWidth];
  }
};
