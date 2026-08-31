// types
import { TTextPathSampler } from '../pathSampler/types';

export const getCornerStopsInRange = (sampler: TTextPathSampler, lower: number, upper: number): number[] => {
  const cycle = sampler.isClosed ? sampler.totalLength : 0;

  return sampler.cornerLengths.flatMap((corner) => {
    const firstTurn = cycle > 0 ? Math.ceil((lower - corner) / cycle) : 0;
    const lastTurn = cycle > 0 ? Math.floor((upper - corner) / cycle) : 0;
    const stops: number[] = [];

    for (let turn = firstTurn; turn <= lastTurn; turn += 1) {
      const length = corner + turn * cycle;

      if (length > lower && length < upper) {
        stops.push(length);
      }
    }

    return stops;
  });
};
