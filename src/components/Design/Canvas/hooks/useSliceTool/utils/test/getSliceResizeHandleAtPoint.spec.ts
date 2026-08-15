// types
import { TSliceDraft } from '../../types';

// utils
import { getSliceResizeHandleAtPoint } from '../getSliceResizeHandleAtPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const slice = (rotation = 0): TSliceDraft => ({ height: 100, rotation, width: 100, x: 0, y: 0 });

describe('getSliceResizeHandleAtPoint', () => {
  it('should detect each corner handle', () => {
    // result
    expect(getSliceResizeHandleAtPoint({ x: 0, y: 0 }, slice(), IDENTITY_VIEWPORT)).toBe('nw');
    expect(getSliceResizeHandleAtPoint({ x: 100, y: 0 }, slice(), IDENTITY_VIEWPORT)).toBe('ne');
    expect(getSliceResizeHandleAtPoint({ x: 100, y: 100 }, slice(), IDENTITY_VIEWPORT)).toBe('se');
    expect(getSliceResizeHandleAtPoint({ x: 0, y: 100 }, slice(), IDENTITY_VIEWPORT)).toBe('sw');
  });

  it('should detect each edge handle', () => {
    // result
    expect(getSliceResizeHandleAtPoint({ x: 50, y: 0 }, slice(), IDENTITY_VIEWPORT)).toBe('n');
    expect(getSliceResizeHandleAtPoint({ x: 50, y: 100 }, slice(), IDENTITY_VIEWPORT)).toBe('s');
    expect(getSliceResizeHandleAtPoint({ x: 0, y: 50 }, slice(), IDENTITY_VIEWPORT)).toBe('w');
    expect(getSliceResizeHandleAtPoint({ x: 100, y: 50 }, slice(), IDENTITY_VIEWPORT)).toBe('e');
  });

  it('should return null far from every handle', () => {
    // result
    expect(getSliceResizeHandleAtPoint({ x: 50, y: 50 }, slice(), IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should prioritize a corner over an overlapping edge', () => {
    // result
    expect(getSliceResizeHandleAtPoint({ x: 0, y: 0 }, slice(), IDENTITY_VIEWPORT)).toBe('nw');
  });

  it('should detect the handle at its actual rotated position', () => {
    // mock — rotating 90deg around center (50, 50) swings the raw "nw" corner over to "sw"
    const rotatedSlice = slice(90);

    // result
    expect(getSliceResizeHandleAtPoint({ x: 0, y: 0 }, rotatedSlice, IDENTITY_VIEWPORT)).toBe('sw');
    expect(getSliceResizeHandleAtPoint(rotatePoint({ x: 0, y: 0 }, { x: 50, y: 50 }, 90), rotatedSlice, IDENTITY_VIEWPORT)).toBe('nw');
  });

  it('should widen the hit radius in world units as the viewport zooms out', () => {
    // result
    expect(getSliceResizeHandleAtPoint({ x: -10, y: 0 }, slice(), IDENTITY_VIEWPORT)).toBeNull();
    expect(getSliceResizeHandleAtPoint({ x: -10, y: 0 }, slice(), { x: 0, y: 0, zoom: 0.5 })).toBe('nw');
  });
});
