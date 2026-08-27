// types
import { TPoint } from 'types/canvas';
import { TErasedSegmentGeometry, TSegmentEraseInterval } from './types';

// utils
import { flattenSegment } from '../flattenSegment';
import { getPathDistance } from './getCapsuleDistance';
import { getVectorCurveSegmentCount } from '../getVectorCurveSegmentCount';

const ENDPOINT_EPS = 0.001;
const MAX_EDGE_SAMPLES = 4000;
const MIN_SAMPLE_STEP = 0.05;

type TSample = { point: TPoint; t: number };

const sampleSegment = (geometry: TErasedSegmentGeometry, maxStep: number): TSample[] => {
  const { end, start, tangentEnd, tangentStart } = geometry;
  const flattened = flattenSegment(start, end, tangentStart, tangentEnd, getVectorCurveSegmentCount(start, end, tangentStart, tangentEnd));
  const edgeCount = flattened.length - 1;
  const samples: TSample[] = [{ point: flattened[0], t: 0 }];

  flattened.slice(0, -1).forEach((from, index) => {
    const to = flattened[index + 1];
    const steps = Math.max(1, Math.min(MAX_EDGE_SAMPLES, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / maxStep)));

    for (let step = 1; step <= steps; step += 1) {
      const fraction = step / steps;

      samples.push({
        point: { x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction },
        t: (index + fraction) / edgeCount,
      });
    }
  });

  return samples;
};

export const getSegmentEraseInterval = (geometry: TErasedSegmentGeometry, brushPath: TPoint[], radius: number): TSegmentEraseInterval => {
  const samples = sampleSegment(geometry, Math.max(radius / 2, MIN_SAMPLE_STEP));
  const insideIndices = samples
    .map((sample, index) => ({ index, inside: getPathDistance(sample.point, brushPath) <= radius }))
    .filter(({ inside }) => inside)
    .map(({ index }) => index);

  if (insideIndices.length !== 0) {
    const firstIn = insideIndices[0];
    const lastOut = insideIndices[insideIndices.length - 1];
    const tIn = samples[firstIn].t;
    const tOut = samples[lastOut].t;
    const coversStart = firstIn === 0;
    const coversEnd = lastOut === samples.length - 1;

    switch (true) {
      case coversStart && coversEnd:
        return { kind: 'whole' };
      case coversStart:
        return tOut <= ENDPOINT_EPS ? { kind: 'none' } : { kind: 'start', tOut };
      case coversEnd:
        return tIn >= 1 - ENDPOINT_EPS ? { kind: 'none' } : { kind: 'end', tIn };
      default:
        return tOut - tIn <= ENDPOINT_EPS ? { kind: 'none' } : { kind: 'middle', tIn, tOut };
    }
  }

  return { kind: 'none' };
};
