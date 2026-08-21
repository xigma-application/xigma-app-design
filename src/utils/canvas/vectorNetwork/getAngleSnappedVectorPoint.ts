// others
import {
  VECTOR_ANGLE_SNAP_MIN_TOLERANCE_DEGREES,
  VECTOR_ANGLE_SNAP_TOLERANCE_DEGREES,
  VECTOR_SHIFT_ANGLE_SNAP_INCREMENT_DEGREES,
} from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getAngularDistance, pickClosestAngleMatch } from 'utils/math/pickClosestAngleMatch';

export type TAngleSnappedPoint = { isSnapped: boolean; point: TPoint };

const CARDINAL_ANGLE_CANDIDATES = [0, 90, 180, -90].map((angle) => ({ angle }));

const getAngleSnapToleranceDegrees = (zoom: number): number =>
  Math.max(VECTOR_ANGLE_SNAP_MIN_TOLERANCE_DEGREES, VECTOR_ANGLE_SNAP_TOLERANCE_DEGREES / Math.max(zoom, 1));

const getPointOnSnapAngle = (from: TPoint, to: TPoint, snapAngleDegrees: number): TPoint => {
  if (snapAngleDegrees === 0 || snapAngleDegrees === 180 || snapAngleDegrees === -180) {
    return { x: to.x, y: from.y };
  }

  if (snapAngleDegrees === 90 || snapAngleDegrees === -90) {
    return { x: from.x, y: to.y };
  }

  const radians = (snapAngleDegrees * Math.PI) / 180;
  const directionX = Math.cos(radians);
  const directionY = Math.sin(radians);
  const projectedDistance = (to.x - from.x) * directionX + (to.y - from.y) * directionY;

  return { x: from.x + projectedDistance * directionX, y: from.y + projectedDistance * directionY };
};

const getShiftSnappedPoint = (from: TPoint, to: TPoint): TPoint => {
  const angle = getAngleBetweenPoints(from, to);
  const snapAngle = Math.round(angle / VECTOR_SHIFT_ANGLE_SNAP_INCREMENT_DEGREES) * VECTOR_SHIFT_ANGLE_SNAP_INCREMENT_DEGREES;

  return getPointOnSnapAngle(from, to, snapAngle);
};

export const getAngleSnappedVectorPoint = (from: TPoint, to: TPoint, zoom: number, isShiftPressed = false): TAngleSnappedPoint => {
  if (to.x === from.x && to.y === from.y) {
    return { isSnapped: false, point: to };
  }

  if (isShiftPressed) {
    return { isSnapped: true, point: getShiftSnappedPoint(from, to) };
  }

  const angle = getAngleBetweenPoints(from, to);
  const { angle: snapAngle } = pickClosestAngleMatch(CARDINAL_ANGLE_CANDIDATES, angle);

  if (getAngularDistance(angle, snapAngle) > getAngleSnapToleranceDegrees(zoom)) {
    return { isSnapped: false, point: to };
  }

  return { isSnapped: true, point: getPointOnSnapAngle(from, to, snapAngle) };
};
