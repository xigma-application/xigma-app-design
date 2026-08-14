// types
import { TDraftRect, TEllipseArcLengthSample, TNearestEllipsePathOffset, TPoint } from 'types/canvas';

// utils
import { getCumulativeLengthAtAngle } from './getCumulativeLengthAtAngle';
import { getEllipseCircumference } from '../getEllipseCircumference';
import { getEllipsePathSample } from '../getEllipsePathSample';
import { normalizeAngle } from './normalizeAngle';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getNearestEllipsePathOffset = (
  point: TPoint,
  ellipse: TDraftRect & { rotation: number },
  table: TEllipseArcLengthSample[],
): TNearestEllipsePathOffset => {
  const center: TPoint = { x: ellipse.x + ellipse.width / 2, y: ellipse.y + ellipse.height / 2 };
  const radiusX = ellipse.width / 2;
  const radiusY = ellipse.height / 2;
  let result: TNearestEllipsePathOffset = { distance: Math.hypot(point.x - center.x, point.y - center.y), offset: 0, point: center };

  if (radiusX > 0 && radiusY > 0) {
    const localPoint = rotatePoint(point, center, -ellipse.rotation);
    const angle = normalizeAngle(Math.atan2((localPoint.y - center.y) / radiusY, (localPoint.x - center.x) / radiusX));
    const circumference = getEllipseCircumference(table);
    const cumulativeLength = getCumulativeLengthAtAngle(angle, table);
    const offset = circumference > 0 ? cumulativeLength / circumference : 0;
    const sample = getEllipsePathSample(ellipse.width, ellipse.height, table, cumulativeLength);
    const curvePoint = rotatePoint({ x: center.x + sample.x, y: center.y + sample.y }, center, ellipse.rotation);

    result = { distance: Math.hypot(point.x - curvePoint.x, point.y - curvePoint.y), offset, point: curvePoint };
  }

  return result;
};
