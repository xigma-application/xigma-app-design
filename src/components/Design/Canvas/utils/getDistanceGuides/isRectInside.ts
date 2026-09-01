// types
import { TEdges } from './types';

export const isRectInside = (outer: TEdges, inner: TEdges): boolean =>
  outer.left <= inner.left && outer.right >= inner.right && outer.top <= inner.top && outer.bottom >= inner.bottom;
