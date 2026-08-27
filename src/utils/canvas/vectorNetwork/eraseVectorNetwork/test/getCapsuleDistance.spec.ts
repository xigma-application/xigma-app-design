// utils
import { getCapsuleDistance, getPathDistance } from '../getCapsuleDistance';

describe('getCapsuleDistance', () => {
  it('should measure the perpendicular distance to the capsule axis for a point beside it', () => {
    // result — point (50, 10) is 10 above the axis (0,0)->(100,0)
    expect(getCapsuleDistance({ x: 50, y: 10 }, { x: 0, y: 0 }, { x: 100, y: 0 })).toBe(10);
  });

  it('should clamp past the capsule end, measuring distance to the nearer endpoint', () => {
    // result — point (130, 0) is 30 past the (100,0) end
    expect(getCapsuleDistance({ x: 130, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 })).toBe(30);
  });

  it('should treat a zero-length capsule as a point (a single eraser dab)', () => {
    // result — plain radial distance from the dab centre
    expect(getCapsuleDistance({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBe(5);
  });
});

describe('getPathDistance', () => {
  it('should measure the radial distance for a single-point path (a dab)', () => {
    // result
    expect(getPathDistance({ x: 3, y: 4 }, [{ x: 0, y: 0 }])).toBe(5);
  });

  it('should take the minimum distance across every leg of a multi-point path', () => {
    // mock — an L-shaped stroke; the point sits 2 above the second leg
    const path = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];

    // result — nearer to the vertical leg (2) than to the horizontal one (60)
    expect(getPathDistance({ x: 98, y: 60 }, path)).toBe(2);
  });
});
