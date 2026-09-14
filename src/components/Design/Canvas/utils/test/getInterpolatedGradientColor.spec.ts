// utils
import { getInterpolatedGradientColor } from '../getInterpolatedGradientColor';

const STOPS = [
  { color: '#ffffff', opacity: 100, position: 0 },
  { color: '#000000', opacity: 100, position: 1 },
];

describe('getInterpolatedGradientColor', () => {
  it('should return the exact first stop color at its own position', () => {
    expect(getInterpolatedGradientColor(STOPS, 0)).toEqual({ color: '#ffffff', opacity: 100 });
  });

  it('should return the exact last stop color at its own position', () => {
    expect(getInterpolatedGradientColor(STOPS, 1)).toEqual({ color: '#000000', opacity: 100 });
  });

  it('should blend halfway between the two stops at the midpoint', () => {
    expect(getInterpolatedGradientColor(STOPS, 0.5)).toEqual({ color: '#808080', opacity: 100 });
  });

  it('should clamp to the first stop color before the range', () => {
    expect(getInterpolatedGradientColor(STOPS, -0.5)).toEqual({ color: '#ffffff', opacity: 100 });
  });

  it('should clamp to the last stop color past the range', () => {
    expect(getInterpolatedGradientColor(STOPS, 1.5)).toEqual({ color: '#000000', opacity: 100 });
  });

  it('should pick the correct bracketing pair with three or more stops', () => {
    const stops = [
      { color: '#ffffff', opacity: 100, position: 0 },
      { color: '#ff0000', opacity: 100, position: 0.5 },
      { color: '#000000', opacity: 100, position: 1 },
    ];

    expect(getInterpolatedGradientColor(stops, 0.75)).toEqual({ color: '#800000', opacity: 100 });
  });

  it('should interpolate opacity between the two bracketing stops', () => {
    const stops = [
      { color: '#ff0000', opacity: 0, position: 0 },
      { color: '#ff0000', opacity: 100, position: 1 },
    ];

    expect(getInterpolatedGradientColor(stops, 0.5)).toEqual({ color: '#ff0000', opacity: 50 });
  });

  it('should not throw and just return the single stop when only one exists', () => {
    expect(getInterpolatedGradientColor([{ color: '#ff0000', opacity: 100, position: 0.5 }], 0.9)).toEqual({
      color: '#ff0000',
      opacity: 100,
    });
  });
});
