// types
import { TPoint } from 'types/canvas';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';
import { scaleAxis } from './scaleAxis';

export const scalePoint = (point: TPoint, snapshot: TVectorNodeResizeSnapshot): TPoint => {
  const scaled = { x: scaleAxis(point.x, snapshot.anchorX, snapshot.scaleX), y: scaleAxis(point.y, snapshot.anchorY, snapshot.scaleY) };

  if (snapshot.rotation) {
    const shifted = {
      x: scaled.x - snapshot.scaledCenter.x + snapshot.pivot.x,
      y: scaled.y - snapshot.scaledCenter.y + snapshot.pivot.y,
    };

    return rotatePoint(shifted, snapshot.pivot, snapshot.rotation);
  }

  return scaled;
};
