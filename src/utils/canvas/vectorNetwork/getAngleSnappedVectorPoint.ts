// others
import { VECTOR_ANGLE_SNAP_MIN_TOLERANCE_DEGREES, VECTOR_ANGLE_SNAP_TOLERANCE_DEGREES } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getAngularDistance, pickClosestAngleMatch } from 'utils/math/pickClosestAngleMatch';

export type TAngleSnappedPoint = { isSnapped: boolean; point: TPoint };

const CARDINAL_ANGLE_CANDIDATES = [0, 90, 180, -90].map((angle) => ({ angle }));

const getAngleSnapToleranceDegrees = (zoom: number): number =>
  Math.max(VECTOR_ANGLE_SNAP_MIN_TOLERANCE_DEGREES, VECTOR_ANGLE_SNAP_TOLERANCE_DEGREES / Math.max(zoom, 1));

export const getAngleSnappedVectorPoint = (from: TPoint, to: TPoint, zoom: number): TAngleSnappedPoint => {
  if (to.x === from.x && to.y === from.y) {
    return { isSnapped: false, point: to };
  }

  const angle = getAngleBetweenPoints(from, to);
  const { angle: snapAngle } = pickClosestAngleMatch(CARDINAL_ANGLE_CANDIDATES, angle);

  if (getAngularDistance(angle, snapAngle) > getAngleSnapToleranceDegrees(zoom)) {
    return { isSnapped: false, point: to };
  }

  const isHorizontal = snapAngle === 0 || snapAngle === 180;

  return { isSnapped: true, point: isHorizontal ? { x: to.x, y: from.y } : { x: from.x, y: to.y } };
};
