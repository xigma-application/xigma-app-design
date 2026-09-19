// types
import { StrokeDashCap } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// others
import { STROKE_DASH_MAX_COUNT } from 'constant/strokeDash';

const CAP_ARC_STEPS = 8;
const TANGENT_PROBE = 0.01;

type TRingSample = { inner: TPoint; outer: TPoint };

type TRing = {
  cumulative: number[];
  inner: TPoint[];
  lengths: number[];
  outer: TPoint[];
  perimeter: number;
};

const lerpPoint = (from: TPoint, to: TPoint, t: number): TPoint => ({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });

const getDistance = (from: TPoint, to: TPoint): number => Math.hypot(to.x - from.x, to.y - from.y);

const getMid = (sample: TRingSample): TPoint => lerpPoint(sample.outer, sample.inner, 0.5);

const buildRing = (outer: TPoint[], inner: TPoint[]): TRing => {
  const mids = outer.map((point, index) => lerpPoint(point, inner[index], 0.5));
  const lengths = mids.map((point, index) => getDistance(point, mids[(index + 1) % mids.length]));
  const cumulative = lengths.map((_, index) => lengths.slice(0, index).reduce((total, length) => total + length, 0));

  return { cumulative, inner, lengths, outer, perimeter: lengths.reduce((total, length) => total + length, 0) };
};

const sampleAt = (ring: TRing, distance: number): TRingSample => {
  const wrapped = ((distance % ring.perimeter) + ring.perimeter) % ring.perimeter;
  const index = ring.cumulative.reduce((found, start, candidate) => (start <= wrapped && ring.lengths[candidate] > 0 ? candidate : found), 0);
  const next = (index + 1) % ring.outer.length;
  const t = ring.lengths[index] > 0 ? (wrapped - ring.cumulative[index]) / ring.lengths[index] : 0;

  return { inner: lerpPoint(ring.inner[index], ring.inner[next], t), outer: lerpPoint(ring.outer[index], ring.outer[next], t) };
};

const getTangent = (ring: TRing, distance: number): TPoint => {
  const before = getMid(sampleAt(ring, distance - TANGENT_PROBE));
  const after = getMid(sampleAt(ring, distance + TANGENT_PROBE));
  const length = getDistance(before, after) || 1;

  return { x: (after.x - before.x) / length, y: (after.y - before.y) / length };
};

const getCapPoints = (from: TPoint, to: TPoint, tangent: TPoint, bulge: number): TPoint[] => {
  const center = lerpPoint(from, to, 0.5);

  return Array.from({ length: CAP_ARC_STEPS - 1 }, (_, step) => {
    const angle = (Math.PI * (step + 1)) / CAP_ARC_STEPS;

    return {
      x: center.x + (from.x - center.x) * Math.cos(angle) + tangent.x * bulge * Math.sin(angle),
      y: center.y + (from.y - center.y) * Math.cos(angle) + tangent.y * bulge * Math.sin(angle),
    };
  });
};

const dropDuplicates = (points: TPoint[]): TPoint[] =>
  points.filter((point, index) => {
    const previous = points[(index + points.length - 1) % points.length];

    return point.x !== previous.x || point.y !== previous.y;
  });

const getDashPolygon = (ring: TRing, start: number, end: number, cap: StrokeDashCap, extension: number): TPoint[] => {
  const count = ring.outer.length;
  const from = start - (cap === StrokeDashCap.square ? extension : 0);
  const to = end + (cap === StrokeDashCap.square ? extension : 0);
  const shifted = from < 0 ? ring.perimeter : 0;
  const a = from + shifted;
  const b = to + shifted;
  const first = sampleAt(ring, a);
  const last = sampleAt(ring, b);
  const vertexIndexes = Array.from({ length: count * 2 }, (_, index) => index).filter((index) => {
    const distance = ring.cumulative[index % count] + Math.floor(index / count) * ring.perimeter;

    return distance > a && distance < b;
  });
  const outerPoints = [first.outer, ...vertexIndexes.map((index) => ring.outer[index % count]), last.outer];
  const innerPoints = [first.inner, ...vertexIndexes.map((index) => ring.inner[index % count]), last.inner];
  const isRound = cap === StrokeDashCap.round;
  const endTangent = getTangent(ring, b);
  const startTangent = getTangent(ring, a);
  const endCap = isRound ? getCapPoints(last.outer, last.inner, endTangent, extension) : [];
  const startCap = isRound
    ? getCapPoints(first.inner, first.outer, { x: -startTangent.x, y: -startTangent.y }, extension)
    : [];

  return dropDuplicates([...outerPoints, ...endCap, ...innerPoints.reverse(), ...startCap]);
};

const getHalfWidth = (outer: TPoint[], inner: TPoint[]): number =>
  Math.max(...outer.map((point, index) => getDistance(point, inner[index]) / 2));

export const getBoxDashedStrokePolygons = (outer: TPoint[], inner: TPoint[], pattern: number[], cap: StrokeDashCap): TPoint[][] | null => {
  const ring = buildRing(outer, inner);
  const patternLength = pattern.reduce((total, length) => total + length, 0);
  const repeats = Math.max(1, Math.round(ring.perimeter / patternLength));

  if (ring.perimeter > 0 && patternLength > 0 && repeats * (pattern.length / 2) <= STROKE_DASH_MAX_COUNT) {
    const scale = ring.perimeter / (repeats * patternLength);
    const scaled = pattern.map((length) => length * scale);
    const minGap = Math.min(...scaled.filter((_, index) => index % 2 === 1));
    const extension = cap === StrokeDashCap.none ? 0 : Math.min(getHalfWidth(outer, inner), minGap / 2);
    const offset = -scaled[0] / 2;
    const polygons: TPoint[][] = [];
    let position = offset;

    for (let repeat = 0; repeat < repeats; repeat += 1) {
      scaled.forEach((length, index) => {
        if (index % 2 === 0) {
          polygons.push(getDashPolygon(ring, position, position + length, cap, extension));
        }

        position += length;
      });
    }

    return polygons.filter((polygon) => polygon.length >= 3);
  }

  return null;
};
