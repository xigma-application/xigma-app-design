// utils
import { getGradientMoveSnapPoint } from '../getGradientMoveSnapPoint';

const bounds = { height: 100, width: 200, x: 0, y: 0 };

describe('getGradientMoveSnapPoint', () => {
  it('should snap x to the left edge when close to 0', () => {
    const result = getGradientMoveSnapPoint({ x: 0.02, y: 0.3 }, bounds, 1);

    expect(result.point.x).toBe(0);
    expect(result.snappedX).toBe(true);
    expect(result.snappedY).toBe(false);
  });

  it('should snap x to the center when close to 0.5', () => {
    const result = getGradientMoveSnapPoint({ x: 0.49, y: 0.3 }, bounds, 1);

    expect(result.point.x).toBe(0.5);
    expect(result.snappedX).toBe(true);
  });

  it('should snap x to the right edge when close to 1', () => {
    const result = getGradientMoveSnapPoint({ x: 0.98, y: 0.3 }, bounds, 1);

    expect(result.point.x).toBe(1);
    expect(result.snappedX).toBe(true);
  });

  it('should snap y independently of x', () => {
    const result = getGradientMoveSnapPoint({ x: 0.3, y: 0.01 }, bounds, 1);

    expect(result.point.y).toBe(0);
    expect(result.snappedY).toBe(true);
    expect(result.snappedX).toBe(false);
  });

  it('should snap both axes at once near the exact center', () => {
    const result = getGradientMoveSnapPoint({ x: 0.505, y: 0.495 }, bounds, 1);

    expect(result.point).toEqual({ x: 0.5, y: 0.5 });
    expect(result.snappedX).toBe(true);
    expect(result.snappedY).toBe(true);
  });

  it('should leave the value unchanged and report no snap when far from every landmark', () => {
    const result = getGradientMoveSnapPoint({ x: 0.3, y: 0.3 }, bounds, 1);

    expect(result.point).toEqual({ x: 0.3, y: 0.3 });
    expect(result.snappedX).toBe(false);
    expect(result.snappedY).toBe(false);
  });

  it('should shrink the tolerance as zoom increases', () => {
    const point = { x: 0.02, y: 0.3 };

    expect(getGradientMoveSnapPoint(point, bounds, 1).snappedX).toBe(true);
    expect(getGradientMoveSnapPoint(point, bounds, 4).snappedX).toBe(false);
  });
});
