// utils
import { isInVectorMultiSelectRotateRing } from '../isInVectorMultiSelectRotateRing';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const bounds = { height: 100, width: 100, x: 0, y: 0 };

describe('isInVectorMultiSelectRotateRing', () => {
  it('should return true just outside a corner, even well inside the ordinary 6px resize-corner radius', () => {
    // mock — 3px outside the "se" corner (100,100) — getVectorMultiSelectResizeHandle already refuses
    // this point, so it must land here instead
    expect(isInVectorMultiSelectRotateRing({ x: 103, y: 103 }, bounds, IDENTITY_VIEWPORT, 0)).toBe(true);
  });

  it('should return false for a point inside the box', () => {
    expect(isInVectorMultiSelectRotateRing({ x: 50, y: 50 }, bounds, IDENTITY_VIEWPORT, 0)).toBe(false);
  });

  it('should return false for a point exactly on the box boundary', () => {
    expect(isInVectorMultiSelectRotateRing({ x: 100, y: 100 }, bounds, IDENTITY_VIEWPORT, 0)).toBe(false);
  });

  it('should return false for a point beyond the outer radius', () => {
    expect(isInVectorMultiSelectRotateRing({ x: 130, y: 130 }, bounds, IDENTITY_VIEWPORT, 0)).toBe(false);
  });

  it('should unrotate the point into the box’s own local frame first, so the ring still tracks a tilted box’s true (rotated) corners', () => {
    // mock — the box is rotated 90deg around its center (50,50); the local point 3px outside the "se"
    // corner, (103,103), lands at world (-3,103) once the whole box (and its surrounding space) is
    // rotated 90deg around that same center
    expect(isInVectorMultiSelectRotateRing({ x: -3, y: 103 }, bounds, IDENTITY_VIEWPORT, 90)).toBe(true);
  });
});
