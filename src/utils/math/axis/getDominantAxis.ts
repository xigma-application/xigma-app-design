// others
import { AXIS_LOCK_THRESHOLD_PX } from 'components/Design/Canvas/constants';

// types
import { TAxisLock } from './getAxisLockedPoint';
import { TPoint } from 'types/canvas';

export const getDominantAxis = (anchor: TPoint, current: TPoint, zoom: number): TAxisLock | null => {
  const dx = Math.abs(current.x - anchor.x);
  const dy = Math.abs(current.y - anchor.y);
  const threshold = AXIS_LOCK_THRESHOLD_PX / zoom;

  if (Math.max(dx, dy) >= threshold) {
    return dx > dy ? 'x' : 'y';
  }

  return null;
};
