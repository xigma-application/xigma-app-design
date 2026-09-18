// types
import { BlendMode } from 'types/design/enums';

// utils
import { isBlendModeActive } from '../isBlendModeActive';

describe('isBlendModeActive', () => {
  it('should be false when no blend mode is set', () => {
    expect(isBlendModeActive(undefined)).toBe(false);
  });

  it('should be false for Normal and Pass through, which do not blend', () => {
    expect(isBlendModeActive(BlendMode.normal)).toBe(false);
    expect(isBlendModeActive(BlendMode.passThrough)).toBe(false);
  });

  it('should be true for a real blend mode', () => {
    expect(isBlendModeActive(BlendMode.multiply)).toBe(true);
  });
});
