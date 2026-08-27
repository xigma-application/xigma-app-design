// types
import { TPoint } from 'types/canvas';
import { TVectorTangent } from 'types/design/types';

// utils
import { normalizeVector } from 'utils/math/normalizeVector';

export type TRoundedCornerCurve = { end: TPoint; start: TPoint; tangentEnd: TVectorTangent; tangentStart: TVectorTangent };

const MAX_BEZIER_SWEEP_RADIANS = Math.PI / 2;
const SWEEP_EPSILON = 1e-9;

const rotateVector = (vector: TPoint, radians: number): TPoint => {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return { x: vector.x * cos - vector.y * sin, y: vector.x * sin + vector.y * cos };
};

const rotate90 = (vector: TPoint, sign: number): TPoint => (sign >= 0 ? { x: -vector.y, y: vector.x } : { x: vector.y, y: -vector.x });

const getSubArcCurve = (center: TPoint, radiusAtStart: TPoint, subSweep: number, radius: number, sign: number): TRoundedCornerCurve => {
  const radiusAtEnd = rotateVector(radiusAtStart, subSweep);
  const start = { x: center.x + radiusAtStart.x, y: center.y + radiusAtStart.y };
  const end = { x: center.x + radiusAtEnd.x, y: center.y + radiusAtEnd.y };
  const kappa = (4 / 3) * Math.tan(Math.abs(subSweep) / 4);
  const tangentDirectionAtStart = normalizeVector(rotate90(radiusAtStart, sign));
  const tangentDirectionAtEnd = normalizeVector(rotate90(radiusAtEnd, sign));

  return {
    end,
    start,
    tangentEnd: { x: -tangentDirectionAtEnd.x * kappa * radius, y: -tangentDirectionAtEnd.y * kappa * radius },
    tangentStart: { x: tangentDirectionAtStart.x * kappa * radius, y: tangentDirectionAtStart.y * kappa * radius },
  };
};

export const getRoundedCornerCurves = (
  vertex: TPoint,
  previous: TPoint,
  next: TPoint,
  interiorAngle: number,
  radius: number,
): TRoundedCornerCurve[] => {
  const toPrevious = normalizeVector({ x: previous.x - vertex.x, y: previous.y - vertex.y });
  const toNext = normalizeVector({ x: next.x - vertex.x, y: next.y - vertex.y });
  const halfAngle = interiorAngle / 2;
  const tangentLength = radius / Math.tan(halfAngle);
  const bisectorLength = radius / Math.sin(halfAngle);
  const bisector = normalizeVector({ x: toPrevious.x + toNext.x, y: toPrevious.y + toNext.y });
  const center: TPoint = { x: vertex.x + bisector.x * bisectorLength, y: vertex.y + bisector.y * bisectorLength };
  const entryPoint: TPoint = { x: vertex.x + toPrevious.x * tangentLength, y: vertex.y + toPrevious.y * tangentLength };
  const exitPoint: TPoint = { x: vertex.x + toNext.x * tangentLength, y: vertex.y + toNext.y * tangentLength };
  const radiusAtEntry: TPoint = { x: entryPoint.x - center.x, y: entryPoint.y - center.y };
  const radiusAtExit: TPoint = { x: exitPoint.x - center.x, y: exitPoint.y - center.y };
  const sweep = Math.atan2(
    radiusAtEntry.x * radiusAtExit.y - radiusAtEntry.y * radiusAtExit.x,
    radiusAtEntry.x * radiusAtExit.x + radiusAtEntry.y * radiusAtExit.y,
  );
  const sign = sweep >= 0 ? 1 : -1;
  const subdivisions = Math.max(1, Math.ceil(Math.abs(sweep) / MAX_BEZIER_SWEEP_RADIANS - SWEEP_EPSILON));
  const subSweep = sweep / subdivisions;

  return Array.from({ length: subdivisions }, (_, index) =>
    getSubArcCurve(center, rotateVector(radiusAtEntry, index * subSweep), subSweep, radius, sign),
  );
};
