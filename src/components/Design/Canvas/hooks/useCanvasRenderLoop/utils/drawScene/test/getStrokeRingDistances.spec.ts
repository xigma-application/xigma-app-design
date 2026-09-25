// types
import { TStrokeRing } from '../types';

// utils
import { getStrokeRingDistances } from '../getStrokeRingDistances';

describe('getStrokeRingDistances', () => {
  it('should merge the corner distances with an even grid, dropping duplicates and the closing perimeter', () => {
    // mock
    const ring = { cumulative: [0, 30, 60], perimeter: 90 } as TStrokeRing;

    // result
    expect(getStrokeRingDistances(ring, 25)).toEqual([0, 25, 30, 50, 60, 75]);
  });

  it('should treat distances closer than the epsilon as one', () => {
    // mock
    const ring = { cumulative: [0, 10.0000001], perimeter: 20 } as TStrokeRing;

    // result
    expect(getStrokeRingDistances(ring, 10)).toEqual([0, 10]);
  });
});
