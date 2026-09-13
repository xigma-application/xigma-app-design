// utils
import { getGradientTypeIndex } from '../getGradientTypeIndex';

describe('getGradientTypeIndex', () => {
  it('should map each gradient type to its shader uniform index', () => {
    expect(getGradientTypeIndex('gradient-linear')).toBe(0);
    expect(getGradientTypeIndex('gradient-radial')).toBe(1);
    expect(getGradientTypeIndex('gradient-angular')).toBe(2);
    expect(getGradientTypeIndex('gradient-diamond')).toBe(3);
  });
});
