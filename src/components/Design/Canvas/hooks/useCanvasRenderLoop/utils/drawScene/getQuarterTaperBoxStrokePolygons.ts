// types
import { StrokeAlign } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getBoxStrokePolygons } from './getBoxStrokePolygons';
import { getLoopArcLengthPositions } from 'utils/canvas/getLoopArcLengthPositions';
import { getQuarterTaperWidthMultiplier } from 'utils/design/stroke/getQuarterTaperWidthMultiplier';

const QUARTER_TAPER_SAMPLE_COUNT = 256;

const lerpPoint = (from: TPoint, to: TPoint, t: number): TPoint => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
});

const getDistance = (from: TPoint, to: TPoint): number => Math.hypot(to.x - from.x, to.y - from.y);

const subdivideRing = (outer: TPoint[], inner: TPoint[], targetSampleCount: number): [TPoint[], TPoint[]] => {
  const segmentLengths = outer.map((point, index) => getDistance(point, outer[(index + 1) % outer.length]));
  const perimeter = segmentLengths.reduce((total, length) => total + length, 0);

  if (perimeter > 0) {
    const nextOuter: TPoint[] = [];
    const nextInner: TPoint[] = [];

    outer.forEach((point, index) => {
      const nextIndex = (index + 1) % outer.length;
      const segmentLength = segmentLengths[index];
      const segmentSamples = segmentLength > 0 ? Math.max(1, Math.round((segmentLength / perimeter) * targetSampleCount)) : 0;

      for (let step = 0; step < segmentSamples; step += 1) {
        const t = step / segmentSamples;

        nextOuter.push(lerpPoint(point, outer[nextIndex], t));
        nextInner.push(lerpPoint(inner[index], inner[nextIndex], t));
      }
    });

    return [nextOuter, nextInner];
  }

  return [outer, inner];
};

export const getQuarterTaperBoxStrokePolygons = (
  node: TFrameNode | TRectangleNode,
  width: number,
  strokeAlign: StrokeAlign | undefined,
  flipped: boolean,
): TPoint[][] => {
  const [ring, uniformInner] = getBoxStrokePolygons(node, { bottom: width, left: width, right: width, top: width }, strokeAlign);
  const [outerLoop, innerLoop] = subdivideRing(ring, uniformInner, QUARTER_TAPER_SAMPLE_COUNT);
  const positions = getLoopArcLengthPositions(outerLoop);

  const profiledInnerLoop = innerLoop.map((point, index) =>
    lerpPoint(outerLoop[index], point, getQuarterTaperWidthMultiplier(positions[index], flipped)),
  );

  return [outerLoop, profiledInnerLoop];
};
