// others
import { ARROWHEAD_WING_ANGLE_DEGREES } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';

// utils
import { getEllipsePoints } from 'utils/canvas/shapes/getEllipsePoints';
import { getLineQuadPoints } from './getLineQuadPoints';
import { rotatePoint } from 'utils/math/rotatePoint';

const ARROWHEAD_JOINT_SEGMENTS = 16;

const ORIGIN: TPoint = { x: 0, y: 0 };

const getJointCirclePoints = (center: TPoint, strokeWidth: number): TPoint[] =>
  getEllipsePoints(
    { height: strokeWidth, width: strokeWidth, x: center.x - strokeWidth / 2, y: center.y - strokeWidth / 2 },
    ARROWHEAD_JOINT_SEGMENTS,
  );

export const getArrowheadPolygons = (tip: TPoint, outwardDirection: TPoint, length: number, strokeWidth: number): TPoint[][] => {
  const backDirection: TPoint = { x: -outwardDirection.x, y: -outwardDirection.y };
  const wingEndpoints = [ARROWHEAD_WING_ANGLE_DEGREES, -ARROWHEAD_WING_ANGLE_DEGREES].map((angle) => {
    const wingDirection = rotatePoint(backDirection, ORIGIN, angle);

    return { x: tip.x + wingDirection.x * length, y: tip.y + wingDirection.y * length };
  });

  return [
    ...wingEndpoints.map((wingEndpoint) =>
      getLineQuadPoints({ x1: tip.x, x2: wingEndpoint.x, y1: tip.y, y2: wingEndpoint.y }, strokeWidth),
    ),
    ...[tip, ...wingEndpoints].map((point) => getJointCirclePoints(point, strokeWidth)),
  ];
};
