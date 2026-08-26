// types
import { TBoundingBox } from './types';

export const boundingBoxesOverlap = (a: TBoundingBox, b: TBoundingBox): boolean =>
  a.minX <= b.maxX && b.minX <= a.maxX && a.minY <= b.maxY && b.minY <= a.maxY;
