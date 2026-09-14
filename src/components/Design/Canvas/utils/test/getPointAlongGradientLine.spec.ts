// utils
import { getPointAlongGradientLine } from '../getPointAlongGradientLine';

describe('getPointAlongGradientLine', () => {
  it('should return the start point at position 0', () => {
    expect(getPointAlongGradientLine({ x: 0, y: 0 }, { x: 100, y: 0 }, 0)).toEqual({ x: 0, y: 0 });
  });

  it('should return the end point at position 1', () => {
    expect(getPointAlongGradientLine({ x: 0, y: 0 }, { x: 100, y: 0 }, 1)).toEqual({ x: 100, y: 0 });
  });

  it('should return the midpoint at position 0.5', () => {
    expect(getPointAlongGradientLine({ x: 0, y: 0 }, { x: 100, y: 0 }, 0.5)).toEqual({ x: 50, y: 0 });
  });

  it('should work for a diagonal line', () => {
    expect(getPointAlongGradientLine({ x: 0, y: 0 }, { x: 100, y: 100 }, 0.5)).toEqual({ x: 50, y: 50 });
  });

  it('should extrapolate past the segment for a position outside 0..1', () => {
    expect(getPointAlongGradientLine({ x: 0, y: 0 }, { x: 100, y: 0 }, 1.5)).toEqual({ x: 150, y: 0 });
  });
});
