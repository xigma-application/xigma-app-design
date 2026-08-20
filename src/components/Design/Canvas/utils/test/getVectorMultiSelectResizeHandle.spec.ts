// utils
import { getVectorMultiSelectResizeHandle } from '../getVectorMultiSelectResizeHandle';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const bounds = { height: 100, width: 100, x: 0, y: 0 };

describe('getVectorMultiSelectResizeHandle', () => {
  it('should return the corner handle when the point sits exactly on the corner', () => {
    // result
    expect(getVectorMultiSelectResizeHandle({ x: 100, y: 100 }, bounds, IDENTITY_VIEWPORT, 0)).toBe('se');
  });

  it('should return the corner handle when the point is inside the box near the corner', () => {
    // result
    expect(getVectorMultiSelectResizeHandle({ x: 97, y: 97 }, bounds, IDENTITY_VIEWPORT, 0)).toBe('se');
  });

  it('should return null when the point is outside the box near a corner — reserved for the rotate ring instead', () => {
    // result
    expect(getVectorMultiSelectResizeHandle({ x: 103, y: 103 }, bounds, IDENTITY_VIEWPORT, 0)).toBeNull();
  });

  it('should still return an edge handle from outside the box (edges keep the ordinary symmetric tolerance)', () => {
    // result — 2px above the top edge, well clear of any corner
    expect(getVectorMultiSelectResizeHandle({ x: 50, y: -2 }, bounds, IDENTITY_VIEWPORT, 0)).toBe('n');
  });

  it('should return null when the point misses every handle', () => {
    // result
    expect(getVectorMultiSelectResizeHandle({ x: 50, y: 50 }, bounds, IDENTITY_VIEWPORT, 0)).toBeNull();
  });

  it('should unrotate the point into the box’s own local frame before hit-testing, so a tilted box’s corner is still grabbable at its true (rotated) world position', () => {
    // mock — the box is rotated 90deg around its center (50,50); the local "se" corner (100,100)
    // now sits at world (0,100)
    expect(getVectorMultiSelectResizeHandle({ x: 0, y: 100 }, bounds, IDENTITY_VIEWPORT, 90)).toBe('se');
  });
});
