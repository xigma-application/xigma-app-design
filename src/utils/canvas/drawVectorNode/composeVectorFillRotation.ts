// types
import { TBoxFillRotation } from './drawVectorPatternSourceTile';
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const composeVectorFillRotation = (base: TBoxFillRotation, pivot: TPoint, degrees: number): TBoxFillRotation => {
  const { localBounds } = base;
  const localCenter = { x: localBounds.x + localBounds.width / 2, y: localBounds.y + localBounds.height / 2 };
  const center = rotatePoint(rotatePoint(localCenter, base.center, base.degrees), pivot, degrees);

  return {
    center,
    degrees: base.degrees + degrees,
    localBounds: { ...localBounds, x: center.x - localBounds.width / 2, y: center.y - localBounds.height / 2 },
  };
};
