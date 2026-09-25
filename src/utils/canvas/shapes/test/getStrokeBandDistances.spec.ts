// types
import { StrokeAlign } from 'types/design/enums';

// utils
import { getStrokeBandDistances } from '../getStrokeBandDistances';

describe('getStrokeBandDistances', () => {
  it('should split a centred stroke evenly', () => {
    // result
    expect(getStrokeBandDistances(StrokeAlign.center, 10)).toEqual([5, 5]);
  });

  it('should put an outside stroke away from the shape', () => {
    // result
    expect(getStrokeBandDistances(StrokeAlign.outside, 10)).toEqual([10, 0]);
  });

  it('should put an inside stroke toward the shape', () => {
    // result
    expect(getStrokeBandDistances(StrokeAlign.inside, 10)).toEqual([0, 10]);
  });
});
