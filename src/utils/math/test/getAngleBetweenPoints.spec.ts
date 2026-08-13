// utils
import { getAngleBetweenPoints } from '../getAngleBetweenPoints';

describe('getAngleBetweenPoints', () => {
  it('should return 0 degrees for a point directly to the east', () => {
    expect(getAngleBetweenPoints({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(0);
  });

  it('should return 90 degrees for a point directly to the south', () => {
    expect(getAngleBetweenPoints({ x: 0, y: 0 }, { x: 0, y: 10 })).toBe(90);
  });

  it('should return -90 degrees for a point directly to the north', () => {
    expect(getAngleBetweenPoints({ x: 0, y: 0 }, { x: 0, y: -10 })).toBe(-90);
  });

  it('should return 180 degrees for a point directly to the west', () => {
    expect(getAngleBetweenPoints({ x: 0, y: 0 }, { x: -10, y: 0 })).toBe(180);
  });

  it('should measure the angle relative to an arbitrary origin, not just (0, 0)', () => {
    expect(getAngleBetweenPoints({ x: 5, y: 5 }, { x: 15, y: 5 })).toBe(0);
  });
});
