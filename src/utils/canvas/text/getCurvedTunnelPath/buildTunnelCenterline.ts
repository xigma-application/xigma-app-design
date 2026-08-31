// constant
import { CURVED_TUNNEL_SAMPLE_STEP_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TTextPathSampler } from '../pathSampler/types';

// utils
import { addPoint } from './addPoint';
import { getCornerStopsInRange } from './getCornerStopsInRange';

export const buildTunnelCenterline = (sampler: TTextPathSampler, pathCenter: TPoint, fromLength: number, toLength: number): TPoint[] => {
  const lower = Math.min(fromLength, toLength);
  const upper = Math.max(fromLength, toLength);
  const stepCount = Math.max(1, Math.ceil((upper - lower) / CURVED_TUNNEL_SAMPLE_STEP_PX));
  const stops = new Set<number>([fromLength, toLength, ...getCornerStopsInRange(sampler, lower, upper)]);

  for (let step = 1; step < stepCount; step += 1) {
    stops.add(lower + ((upper - lower) * step) / stepCount);
  }

  const ascending = fromLength <= toLength;
  const ordered = [...stops].sort((a, b) => (ascending ? a - b : b - a));

  return ordered.reduce<TPoint[]>((points, length) => {
    const point = addPoint(pathCenter, sampler.sampleAtLength(length));
    const previous = points[points.length - 1];

    return previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 1e-6 ? points : [...points, point];
  }, []);
};
