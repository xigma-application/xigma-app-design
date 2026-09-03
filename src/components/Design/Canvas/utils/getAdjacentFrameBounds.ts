// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TFrameNode } from 'types/design/types';

// utils
import { getRectCenter } from './getRectCenter';
import { getRotatedNodeBounds } from './getRotatedNodeBounds';

const isPointInBounds = (point: TPoint, bounds: TDraftRect): boolean =>
  point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height;

const getDistanceToBoundsCenter = (point: TPoint, bounds: TDraftRect): number => {
  const center = getRectCenter(bounds);
  return Math.hypot(point.x - center.x, point.y - center.y);
};

const getClosestBoundsIndex = (orderedBounds: TDraftRect[], point: TPoint): number =>
  orderedBounds.reduce(
    (closestIndex, bounds, index) =>
      getDistanceToBoundsCenter(point, bounds) < getDistanceToBoundsCenter(point, orderedBounds[closestIndex]) ? index : closestIndex,
    0,
  );

export const getAdjacentFrameBounds = (
  frames: TFrameNode[],
  viewportCenterWorld: TPoint,
  direction: 'next' | 'previous',
): TDraftRect | null => {
  if (frames.length > 0) {
    const orderedBounds = frames.map(getRotatedNodeBounds).sort((a, b) => a.x - b.x);
    const containingIndex = orderedBounds.findIndex((bounds) => isPointInBounds(viewportCenterWorld, bounds));
    const currentIndex = containingIndex === -1 ? getClosestBoundsIndex(orderedBounds, viewportCenterWorld) : containingIndex;
    const step = direction === 'next' ? 1 : -1;

    return orderedBounds[(currentIndex + step + orderedBounds.length) % orderedBounds.length];
  }

  return null;
};
