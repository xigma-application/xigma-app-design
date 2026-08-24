// others
import { PENCIL_AXIS_LOCK_THRESHOLD_PX } from '../../../../constants';

// types
import { TPencilAxis } from './getAxisLockedPoint';
import { TPoint } from 'types/canvas';

export const getDominantAxis = (anchor: TPoint, current: TPoint, zoom: number): TPencilAxis | null => {
  const dx = Math.abs(current.x - anchor.x);
  const dy = Math.abs(current.y - anchor.y);
  const threshold = PENCIL_AXIS_LOCK_THRESHOLD_PX / zoom;

  if (Math.max(dx, dy) >= threshold) {
    return dx > dy ? 'x' : 'y';
  }

  return null;
};
