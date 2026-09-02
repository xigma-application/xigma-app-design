// types
import { TDistanceGuides } from '../getDistanceGuides/types';
import { TVectorDistanceAnchor, TVectorDistanceTarget } from './types';

// utils
import { getPointToPointGuides } from './getPointToPointGuides';
import { getPointToSegmentGuides } from './getPointToSegmentGuides';

export const getVectorDistanceGuides = (anchor: TVectorDistanceAnchor, target: TVectorDistanceTarget): TDistanceGuides =>
  target.kind === 'vertex' ? getPointToPointGuides(anchor.point, target.point) : getPointToSegmentGuides(anchor.point, target.polyline);
