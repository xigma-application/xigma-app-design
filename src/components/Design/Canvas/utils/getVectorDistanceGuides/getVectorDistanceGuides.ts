// types
import { TDistanceGuides } from '../getDistanceGuides/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TVectorDistanceAnchor, TVectorDistanceTarget } from './types';

// utils
import { getDistanceGuides } from '../getDistanceGuides/getDistanceGuides';
import { getPointToPointGuides } from './getPointToPointGuides';
import { getPointToSegmentGuides } from './getPointToSegmentGuides';
import { getPolylineBounds } from './getPolylineBounds';

const toZeroRect = (point: TPoint): TDraftRect => ({ height: 0, width: 0, x: point.x, y: point.y });

export const getVectorDistanceGuides = (anchor: TVectorDistanceAnchor, target: TVectorDistanceTarget): TDistanceGuides => {
  if (anchor.kind === 'point') {
    return target.kind === 'vertex'
      ? getPointToPointGuides(anchor.point, target.point)
      : getPointToSegmentGuides(anchor.point, target.polyline);
  }

  const targetRect = target.kind === 'vertex' ? toZeroRect(target.point) : getPolylineBounds(target.polyline);
  const { labels, lines } = getDistanceGuides(anchor.rect, targetRect);

  return { labels, lines };
};
