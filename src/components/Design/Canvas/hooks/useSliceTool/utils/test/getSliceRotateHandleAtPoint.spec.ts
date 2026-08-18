// types
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { getSliceRotateHandleAtPoint } from '../getSliceRotateHandleAtPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const slice = (rotation = 0): TSliceDraft => ({ height: 100, rotation, width: 100, x: 0, y: 0 });

describe('getSliceRotateHandleAtPoint', () => {
  it('should detect the ring just outside a corner handle', () => {
    // result — the "nw" corner sits at (0, 0); CORNER_HANDLE_SIZE is 6, ROTATE_HANDLE_OUTER_RADIUS_PX is 16
    expect(getSliceRotateHandleAtPoint({ x: 0, y: -10 }, slice(), IDENTITY_VIEWPORT)).toBe(true);
  });

  it('should not detect the ring inside the corner handle radius', () => {
    // result
    expect(getSliceRotateHandleAtPoint({ x: 0, y: -3 }, slice(), IDENTITY_VIEWPORT)).toBe(false);
  });

  it('should not detect the ring for a point inside the bounds', () => {
    // result
    expect(getSliceRotateHandleAtPoint({ x: 5, y: 5 }, slice(), IDENTITY_VIEWPORT)).toBe(false);
  });

  it('should not detect the ring beyond its outer radius', () => {
    // result
    expect(getSliceRotateHandleAtPoint({ x: 0, y: -20 }, slice(), IDENTITY_VIEWPORT)).toBe(false);
  });

  it('should detect the ring at its actual rotated position', () => {
    // mock — rotating 45deg around center (50, 50) swings the raw "nw" corner off axis
    const rotatedSlice = slice(45);
    const rotatedCorner = rotatePoint({ x: 0, y: 0 }, { x: 50, y: 50 }, 45);

    // result
    expect(getSliceRotateHandleAtPoint({ x: rotatedCorner.x, y: rotatedCorner.y - 10 }, rotatedSlice, IDENTITY_VIEWPORT)).toBe(true);
    expect(getSliceRotateHandleAtPoint({ x: 0, y: -10 }, rotatedSlice, IDENTITY_VIEWPORT)).toBe(false);
  });

  it('should widen the ring in world units as the viewport zooms out', () => {
    // result
    expect(getSliceRotateHandleAtPoint({ x: 0, y: -20 }, slice(), IDENTITY_VIEWPORT)).toBe(false);
    expect(getSliceRotateHandleAtPoint({ x: 0, y: -20 }, slice(), { x: 0, y: 0, zoom: 0.5 })).toBe(true);
  });
});
