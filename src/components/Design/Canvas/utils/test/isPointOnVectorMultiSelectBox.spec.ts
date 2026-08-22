// utils
import { isPointOnVectorMultiSelectBox } from '../isPointOnVectorMultiSelectBox';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const bounds = { height: 100, width: 100, x: 0, y: 0 };

describe('isPointOnVectorMultiSelectBox', () => {
  it('should return true for a point on a resize corner', () => {
    expect(isPointOnVectorMultiSelectBox({ x: 100, y: 100 }, bounds, IDENTITY_VIEWPORT, 0)).toBe(true);
  });

  it('should return true for a point just outside a corner, in the rotate ring', () => {
    expect(isPointOnVectorMultiSelectBox({ x: 103, y: 103 }, bounds, IDENTITY_VIEWPORT, 0)).toBe(true);
  });

  it('should return true for a point inside the box interior', () => {
    expect(isPointOnVectorMultiSelectBox({ x: 50, y: 50 }, bounds, IDENTITY_VIEWPORT, 0)).toBe(true);
  });

  it('should return false for a point well outside the box and its rotate ring', () => {
    expect(isPointOnVectorMultiSelectBox({ x: 500, y: 500 }, bounds, IDENTITY_VIEWPORT, 0)).toBe(false);
  });

  it('should account for rotation when checking the interior', () => {
    // mock — the box is rotated 90deg around its center (50,50); local point (10,50), well inside the
    // unrotated box, lands at world (50,90) once rotated — still inside the box's own local frame
    expect(isPointOnVectorMultiSelectBox({ x: 50, y: 90 }, bounds, IDENTITY_VIEWPORT, 90)).toBe(true);
  });
});
