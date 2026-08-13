// utils
import { getRotateCursorAngle } from '../getRotateCursorAngle';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

describe('getRotateCursorAngle', () => {
  it('should be 0 degrees near the north-east corner of an unrotated node', () => {
    // result
    expect(getRotateCursorAngle({ x: 80, y: 20 }, bounds, 0)).toBe(0);
    expect(getRotateCursorAngle({ x: 80, y: 20 }, bounds, 10)).toBe(10);
  });

  it('should offset by 90 degrees near the south-east corner', () => {
    // result
    expect(getRotateCursorAngle({ x: 80, y: 80 }, bounds, 0)).toBe(90);
    expect(getRotateCursorAngle({ x: 80, y: 80 }, bounds, 10)).toBe(100);
  });

  it('should offset by 180 degrees near the south-west corner', () => {
    // result
    expect(getRotateCursorAngle({ x: 20, y: 80 }, bounds, 0)).toBe(180);
  });

  it('should offset by 270 degrees near the north-west corner', () => {
    // result
    expect(getRotateCursorAngle({ x: 20, y: 20 }, bounds, 0)).toBe(270);
  });

  it('should identify the corner in the node local (unrotated) space, not world space', () => {
    // mock — a 90deg rotated node swings its "ne" corner region over to world (80, 80); a world
    expect(getRotateCursorAngle({ x: 80, y: 80 }, bounds, 90)).toBe(90);
  });
});
