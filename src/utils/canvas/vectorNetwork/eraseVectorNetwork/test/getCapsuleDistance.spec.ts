// utils
import { getCapsuleDistance } from '../getCapsuleDistance';

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
