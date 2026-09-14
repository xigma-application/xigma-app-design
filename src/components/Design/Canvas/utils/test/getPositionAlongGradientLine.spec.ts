// utils
import { getPositionAlongGradientLine } from '../getPositionAlongGradientLine';

describe('getPositionAlongGradientLine', () => {
  it('should return 0 at the start point', () => {
    // before
    const position = getPositionAlongGradientLine({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 });

    // result
    expect(position).toBeCloseTo(0);
  });

  it('should return 1 at the end point', () => {
    // before
    const position = getPositionAlongGradientLine({ x: 100, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 });

    // result
    expect(position).toBeCloseTo(1);
  });

  it('should return 0.5 at the midpoint', () => {
    // before
    const position = getPositionAlongGradientLine({ x: 50, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 });

    // result
    expect(position).toBeCloseTo(0.5);
  });

  it('should project a point off the line onto it', () => {
    // before — perpendicular offset from the midpoint should still project to 0.5
    const position = getPositionAlongGradientLine({ x: 50, y: 30 }, { x: 0, y: 0 }, { x: 100, y: 0 });

    // result
    expect(position).toBeCloseTo(0.5);
  });

  it('should clamp before the start point', () => {
    // before
    const position = getPositionAlongGradientLine({ x: -50, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 });

    // result
    expect(position).toBe(0);
  });

  it('should clamp past the end point', () => {
    // before
    const position = getPositionAlongGradientLine({ x: 150, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 });

    // result
    expect(position).toBe(1);
  });

  it('should not throw and return 0 when start and end coincide', () => {
    // before
    const position = getPositionAlongGradientLine({ x: 5, y: 5 }, { x: 10, y: 10 }, { x: 10, y: 10 });

    // result
    expect(position).toBe(0);
  });

  it('should work for a diagonal line', () => {
    // before
    const position = getPositionAlongGradientLine({ x: 50, y: 50 }, { x: 0, y: 0 }, { x: 100, y: 100 });

    // result
    expect(position).toBeCloseTo(0.5);
  });
});
