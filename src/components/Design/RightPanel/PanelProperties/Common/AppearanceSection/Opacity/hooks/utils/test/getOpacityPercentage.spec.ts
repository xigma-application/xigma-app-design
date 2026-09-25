// types
import { TAppearanceNode } from '../../../../types';

// utils
import { getOpacityPercentage } from '../getOpacityPercentage';

describe('getOpacityPercentage', () => {
  it('should return the node opacity as a percentage', () => {
    // result
    expect(getOpacityPercentage({ opacity: 0.25 } as TAppearanceNode)).toBe(25);
  });

  it('should return 100 without a node or opacity', () => {
    // result
    expect(getOpacityPercentage(undefined)).toBe(100);
  });
});
