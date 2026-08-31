// types
import { TTextPathSampler } from '../../pathSampler/types';

// utils
import { getCornerStopsInRange } from '../getCornerStopsInRange';

const buildSampler = (overrides: Partial<TTextPathSampler> = {}): TTextPathSampler => ({
  cornerLengths: [],
  isClosed: false,
  nearestOffsetAtPoint: () => ({ distance: 0, offset: 0, point: { x: 0, y: 0 } }),
  sampleAtLength: () => ({ angleDegrees: 0, x: 0, y: 0 }),
  totalLength: 0,
  ...overrides,
});

describe('getCornerStopsInRange', () => {
  it('should return an empty array when the sampler has no corners', () => {
    // result
    expect(getCornerStopsInRange(buildSampler(), 0, 100)).toEqual([]);
  });

  it('should include a corner strictly inside the range', () => {
    // mock
    const sampler = buildSampler({ cornerLengths: [50] });

    // result
    expect(getCornerStopsInRange(sampler, 0, 100)).toEqual([50]);
  });

  it('should exclude a corner outside the range, and one sitting exactly on either bound', () => {
    // mock
    const sampler = buildSampler({ cornerLengths: [0, 50, 100, 200] });

    // result — 0 and 100 sit exactly on the bounds (excluded, strictly interior only); 200 is past it
    expect(getCornerStopsInRange(sampler, 0, 100)).toEqual([50]);
  });

  it('should fold a closed path corner in on every lap the range spans', () => {
    // mock — a closed 40-unit loop with one corner at length 10; a range spanning 3 laps should
    // pick up that corner once per lap (10, 50, 90), not just its first raw occurrence
    const sampler = buildSampler({ cornerLengths: [10], isClosed: true, totalLength: 40 });

    // result
    expect(getCornerStopsInRange(sampler, 0, 100)).toEqual([10, 50, 90]);
  });
});
