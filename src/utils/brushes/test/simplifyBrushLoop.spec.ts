// utils
import { simplifyBrushLoop } from '../simplifyBrushLoop';

describe('simplifyBrushLoop', () => {
  it('should keep short loops unchanged', () => {
    // mock
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];

    // result
    expect(simplifyBrushLoop(points, 0.1)).toBe(points);
  });

  it('should drop points close to the line between the kept ones and keep the far ones', () => {
    // mock
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0.01 },
      { x: 2, y: 0 },
      { x: 3, y: 5 },
      { x: 4, y: 0 },
      { x: 5, y: 0.01 },
      { x: 6, y: 0 },
    ];

    // result
    expect(simplifyBrushLoop(points, 0.5)).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 5 },
      { x: 4, y: 0 },
      { x: 6, y: 0 },
    ]);
  });

  it('should measure distance to a point when the segment ends coincide', () => {
    // mock
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ];

    // result
    expect(simplifyBrushLoop(points, 1)).toContainEqual({ x: 3, y: 4 });
  });
});
