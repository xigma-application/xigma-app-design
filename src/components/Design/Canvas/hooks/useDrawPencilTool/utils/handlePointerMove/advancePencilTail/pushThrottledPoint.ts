// others
import { MIN_DRAG_DISTANCE_PX } from '../../../../../constants';

// types
import { TPoint } from 'types/canvas';

export const pushThrottledPoint = (tail: TPoint[], currentPoint: TPoint, zoom: number): void => {
  const lastPoint = tail[tail.length - 1];
  const distance = Math.hypot(currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y);

  if (distance >= MIN_DRAG_DISTANCE_PX / zoom) {
    tail.push(currentPoint);
  }
};
