// others
import { ELLIPSE_ARC_LENGTH_SEGMENTS } from 'constant/canvas';

// types
import { TEllipseArcLengthSample } from 'types/canvas';

export const buildEllipseArcLengthTable = (
  width: number,
  height: number,
  segments: number = ELLIPSE_ARC_LENGTH_SEGMENTS,
): TEllipseArcLengthSample[] => {
  const radiusX = width / 2;
  const radiusY = height / 2;
  const table: TEllipseArcLengthSample[] = [{ angle: 0, cumulativeLength: 0 }];
  let previousPoint = { x: radiusX, y: 0 };

  for (let index = 1; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const point = { x: radiusX * Math.cos(angle), y: radiusY * Math.sin(angle) };
    const segmentLength = Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);

    table.push({ angle, cumulativeLength: table[index - 1].cumulativeLength + segmentLength });
    previousPoint = point;
  }

  return table;
};
