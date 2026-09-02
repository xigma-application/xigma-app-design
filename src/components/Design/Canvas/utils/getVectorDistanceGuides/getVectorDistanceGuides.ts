// types
import { TDistanceGuides } from '../getDistanceGuides/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TVectorDistanceEndpoint } from './types';

// utils
import { getDistanceGuides } from '../getDistanceGuides/getDistanceGuides';
import { getPointToPointGuides } from './getPointToPointGuides';

const toZeroRect = (point: TPoint): TDraftRect => ({ height: 0, width: 0, x: point.x, y: point.y });

export const getVectorDistanceGuides = (anchor: TVectorDistanceEndpoint, target: TVectorDistanceEndpoint): TDistanceGuides => {
  const targetPoint = target.kind === 'point' ? target.point : undefined;

  if (anchor.kind === 'point' && target.kind === 'point') {
    return { ...getPointToPointGuides(anchor.point, target.point), targetPoint };
  }

  const anchorRect = anchor.kind === 'box' ? anchor.rect : toZeroRect(anchor.point);
  const targetRect = target.kind === 'box' ? target.rect : toZeroRect(target.point);
  const { labels, lines } = getDistanceGuides(anchorRect, targetRect);

  return { labels, lines, targetPoint };
};
