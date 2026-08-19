// utils
import { getHandleAtBounds } from '../getHandleAtBounds';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getHandleAtBounds', () => {
  it('should detect each corner handle', () => {
    // result
    expect(getHandleAtBounds({ x: 0, y: 0 }, BOUNDS, IDENTITY_VIEWPORT)).toBe('nw');
    expect(getHandleAtBounds({ x: 100, y: 0 }, BOUNDS, IDENTITY_VIEWPORT)).toBe('ne');
    expect(getHandleAtBounds({ x: 100, y: 100 }, BOUNDS, IDENTITY_VIEWPORT)).toBe('se');
    expect(getHandleAtBounds({ x: 0, y: 100 }, BOUNDS, IDENTITY_VIEWPORT)).toBe('sw');
  });

  it('should detect each edge handle', () => {
    // result
    expect(getHandleAtBounds({ x: 50, y: 0 }, BOUNDS, IDENTITY_VIEWPORT)).toBe('n');
    expect(getHandleAtBounds({ x: 50, y: 100 }, BOUNDS, IDENTITY_VIEWPORT)).toBe('s');
    expect(getHandleAtBounds({ x: 0, y: 50 }, BOUNDS, IDENTITY_VIEWPORT)).toBe('w');
    expect(getHandleAtBounds({ x: 100, y: 50 }, BOUNDS, IDENTITY_VIEWPORT)).toBe('e');
  });

  it('should prioritize a corner over an overlapping edge', () => {
    // result — (0,0) is within both the "nw" corner radius and the "n"/"w" edge tolerance
    expect(getHandleAtBounds({ x: 0, y: 0 }, BOUNDS, IDENTITY_VIEWPORT)).toBe('nw');
  });

  it('should return null outside the bounds span, or far from any edge', () => {
    // result — above the top-left corner's hit radius, so out of the horizontal span for "n"
    expect(getHandleAtBounds({ x: -20, y: 0 }, BOUNDS, IDENTITY_VIEWPORT)).toBeNull();
    // dead center, far from every corner and edge
    expect(getHandleAtBounds({ x: 50, y: 50 }, BOUNDS, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should widen the hit radius in world units as the viewport zooms out', () => {
    // result — CORNER_HANDLE_SIZE is 6, so 10 world units off the "nw" corner misses at zoom 1
    expect(getHandleAtBounds({ x: -10, y: 0 }, BOUNDS, IDENTITY_VIEWPORT)).toBeNull();
    expect(getHandleAtBounds({ x: -10, y: 0 }, BOUNDS, { x: 0, y: 0, zoom: 0.5 })).toBe('nw');
  });
});
