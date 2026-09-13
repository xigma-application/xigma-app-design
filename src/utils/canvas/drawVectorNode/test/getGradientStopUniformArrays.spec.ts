// others
import { MAX_GRADIENT_STOPS } from 'constant/webgl/vectorGradientFillConstants';

// utils
import { getGradientStopUniformArrays } from '../getGradientStopUniformArrays';

describe('getGradientStopUniformArrays', () => {
  it('should convert each stop into a padded rgba float and its position', () => {
    // before
    const result = getGradientStopUniformArrays([
      { color: '#ff0000', opacity: 100, position: 0 },
      { color: '#0000ff', opacity: 50, position: 1 },
    ]);

    // result
    expect(result.count).toBe(2);
    expect(Array.from(result.positions.slice(0, 2))).toEqual([0, 1]);
    expect(Array.from(result.colors.slice(0, 8))).toEqual([1, 0, 0, 1, 0, 0, 1, 0.5]);
  });

  it('should always return fixed-size arrays sized for the shader’s uniform array, regardless of stop count', () => {
    // before
    const result = getGradientStopUniformArrays([{ color: '#ffffff', opacity: 100, position: 0 }]);

    // result
    expect(result.colors).toHaveLength(MAX_GRADIENT_STOPS * 4);
    expect(result.positions).toHaveLength(MAX_GRADIENT_STOPS);
  });

  it('should clamp to the max supported stop count instead of overflowing the fixed-size uniform arrays', () => {
    // mock
    const stops = Array.from({ length: MAX_GRADIENT_STOPS + 3 }, (_, index) => ({
      color: '#ffffff',
      opacity: 100,
      position: index / (MAX_GRADIENT_STOPS + 2),
    }));

    // before
    const result = getGradientStopUniformArrays(stops);

    // result
    expect(result.count).toBe(MAX_GRADIENT_STOPS);
  });
});
