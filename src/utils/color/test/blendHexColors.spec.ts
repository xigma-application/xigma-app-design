// utils
import { blendHexColors } from '../blendHexColors';

describe('blendHexColors', () => {
  it('should return the top color at full alpha', () => {
    expect(blendHexColors('#ffffff', '#000000', 1)).toBe('#ffffff');
  });

  it('should return the bottom color at zero alpha', () => {
    expect(blendHexColors('#ffffff', '#123456', 0)).toBe('#123456');
  });

  it('should mix white over black at half alpha into mid gray', () => {
    expect(blendHexColors('#ffffff', '#000000', 0.5)).toBe('#808080');
  });
});
