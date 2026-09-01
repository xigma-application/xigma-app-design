// types
import { TBounds } from './types';

export const isBoundsFullyInside = (inner: TBounds, outer: TBounds): boolean =>
  inner[0] >= outer[0] && inner[1] >= outer[1] && inner[2] <= outer[2] && inner[3] <= outer[3];
