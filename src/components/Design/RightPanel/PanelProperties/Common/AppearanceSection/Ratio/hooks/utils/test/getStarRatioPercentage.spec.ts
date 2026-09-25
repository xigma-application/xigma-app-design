// types
import { TStarNode } from 'types/design/types';

// utils
import { getStarRatioPercentage } from '../getStarRatioPercentage';

describe('getStarRatioPercentage', () => {
  it('should turn the ratio into a percentage with one decimal', () => {
    // result
    expect(getStarRatioPercentage({ ratio: 0.382 } as TStarNode)).toBe(38.2);
    expect(getStarRatioPercentage({ ratio: 0.12345 } as TStarNode)).toBe(12.3);
  });
});
