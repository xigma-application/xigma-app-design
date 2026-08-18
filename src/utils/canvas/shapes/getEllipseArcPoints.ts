// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getEllipseArcMajorArc } from '../ellipseArc/getEllipseArcMajorArc';

export const getEllipseArcPoints = (
  rect: TDraftRect,
  startAngleDeg: number,
  endAngleDeg: number,
  totalSegments: number,
  radiusRatio = 1,
): TPoint[] => {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const radiusX = (rect.width / 2) * radiusRatio;
  const radiusY = (rect.height / 2) * radiusRatio;
  const { majorStart, majorSweep } = getEllipseArcMajorArc(startAngleDeg, endAngleDeg);
  const segments = Math.max(2, Math.round(totalSegments * (Math.abs(majorSweep) / 360)));
  const pointCount = segments + 1;

  return Array.from({ length: pointCount }, (_, index) => {
    const compassAngle = majorStart + (majorSweep * index) / segments;
    const mathAngle = ((compassAngle - 90) * Math.PI) / 180;

    return { x: centerX + radiusX * Math.cos(mathAngle), y: centerY + radiusY * Math.sin(mathAngle) };
  });
};
