// utils
import { getGradientPerpendicularOffsetDirection } from '../getGradientPerpendicularOffsetDirection';

describe('getGradientPerpendicularOffsetDirection', () => {
  it('should point straight up for a horizontal line, matching the historical always-up offset', () => {
    const direction = getGradientPerpendicularOffsetDirection({ x: 0, y: 0 }, { x: 100, y: 0 });

    expect(direction).toEqual({ x: 0, y: -1 });
  });

  it('should point sideways for a vertical line, instead of collapsing onto the line itself', () => {
    const direction = getGradientPerpendicularOffsetDirection({ x: 50, y: 0 }, { x: 50, y: 100 });

    expect(direction.y).toBeCloseTo(0, 5);
    expect(Math.abs(direction.x)).toBeCloseTo(1, 5);
  });

  it('should always return a unit vector', () => {
    const direction = getGradientPerpendicularOffsetDirection({ x: 0, y: 0 }, { x: 30, y: 40 });

    expect(Math.hypot(direction.x, direction.y)).toBeCloseTo(1, 5);
  });

  it('should mirror to the opposite side when the line direction reverses', () => {
    const forward = getGradientPerpendicularOffsetDirection({ x: 0, y: 0 }, { x: 100, y: 100 });
    const reversed = getGradientPerpendicularOffsetDirection({ x: 100, y: 100 }, { x: 0, y: 0 });

    expect(forward.x).toBeCloseTo(-reversed.x, 5);
    expect(forward.y).toBeCloseTo(-reversed.y, 5);
  });

  it('should fall back to straight up when start and end coincide', () => {
    const direction = getGradientPerpendicularOffsetDirection({ x: 5, y: 5 }, { x: 5, y: 5 });

    expect(direction).toEqual({ x: 0, y: -1 });
  });
});
