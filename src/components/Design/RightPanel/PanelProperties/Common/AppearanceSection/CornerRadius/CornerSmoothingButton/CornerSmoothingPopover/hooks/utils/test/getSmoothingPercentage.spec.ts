// types
import { TAppearanceNode } from '../../../../../../types';

// utils
import { getSmoothingPercentage } from '../getSmoothingPercentage';

describe('getSmoothingPercentage', () => {
  it('should return the node smoothing as a percentage', () => {
    // result
    expect(getSmoothingPercentage({ cornerSmoothing: 0.6 } as TAppearanceNode)).toBe(60);
  });

  it('should return 0 without a node or smoothing', () => {
    // result
    expect(getSmoothingPercentage(undefined)).toBe(0);
    expect(getSmoothingPercentage({} as TAppearanceNode)).toBe(0);
  });
});
