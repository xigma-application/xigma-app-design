// utils
import { getBlendModeShaderIndex } from '../getBlendModeShaderIndex';

// types
import { BlendMode } from 'types/design/enums';

describe('getBlendModeShaderIndex', () => {
  it('should map every blend mode to a distinct shader index, except Pass through which aliases Normal', () => {
    // before
    const indexes = Object.values(BlendMode).map((mode) => getBlendModeShaderIndex(mode));
    const distinct = new Set(indexes);

    // result — 19 modes, Pass through shares Normal's index, so 18 distinct indexes
    expect(indexes).toHaveLength(19);
    expect(distinct.size).toBe(18);
    expect(getBlendModeShaderIndex(BlendMode.passThrough)).toBe(getBlendModeShaderIndex(BlendMode.normal));
  });

  it('should return a non-negative integer for every mode', () => {
    Object.values(BlendMode).forEach((mode) => {
      expect(Number.isInteger(getBlendModeShaderIndex(mode))).toBe(true);
      expect(getBlendModeShaderIndex(mode)).toBeGreaterThanOrEqual(0);
    });
  });
});
