// types
import { TEdges } from './types';

// utils
import { isRangeInside } from './isRangeInside';

export const isRectInside = (outer: TEdges, inner: TEdges): boolean =>
  isRangeInside(outer.left, outer.right, inner.left, inner.right) && isRangeInside(outer.top, outer.bottom, inner.top, inner.bottom);
