// types
import { TDistanceGuides } from '../getDistanceGuides/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TVectorDistanceAnchor } from './types';

// utils
import { getDistanceGuides } from '../getDistanceGuides/getDistanceGuides';
import { getPointToPointGuides } from './getPointToPointGuides';

const toZeroRect = (point: TPoint): TDraftRect => ({ height: 0, width: 0, x: point.x, y: point.y });

export const getVectorDistanceGuides = (anchor: TVectorDistanceAnchor, target: TPoint): TDistanceGuides => {
  if (anchor.kind === 'point') {
    return getPointToPointGuides(anchor.point, target);
  }

  const { labels, lines } = getDistanceGuides(anchor.rect, toZeroRect(target));

  return { labels, lines };
};
