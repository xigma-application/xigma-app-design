// types
import { StrokeAlign } from 'types/design/enums';

export type TStrokeAlignInset = { inner: number; outer: number };

export const getStrokeAlignInset = (strokeWidth: number, strokeAlign: StrokeAlign = StrokeAlign.center): TStrokeAlignInset => {
  switch (strokeAlign) {
    case StrokeAlign.inside:
      return { inner: strokeWidth, outer: 0 };
    case StrokeAlign.outside:
      return { inner: 0, outer: strokeWidth };
    default:
      return { inner: strokeWidth / 2, outer: strokeWidth / 2 };
  }
};
