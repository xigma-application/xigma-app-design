// utils
import {
  getScaledVectorMultiSelectBounds,
  getVectorMultiSelectResizeAnchorWorld,
  getVectorMultiSelectResizeScale,
  repositionRotatedVectorMultiSelectBounds,
} from '../getVectorMultiSelectResizeTransform';

const bounds = { height: 50, width: 100, x: 0, y: 0 };

describe('getVectorMultiSelectResizeScale', () => {
  it('should scale from the "max"-side anchor (opposite corner stays put) when dragging a "se" handle out', () => {
    // result — anchor is the "nw" corner (0,0); dragging "se" from (100,50) out to (150,75) is a 1.5x scale on both axes
    expect(getVectorMultiSelectResizeScale(bounds, 'se', 0, { x: 150, y: 75 })).toEqual({
      anchor: { x: 0, y: 0 },
      pivot: { x: 50, y: 25 },
      scaleX: 1.5,
      scaleY: 1.5,
    });
  });

  it('should scale from the "min"-side anchor (the far corner, not the bounds’ own origin) when dragging a "nw" handle out', () => {
    // result — anchor is the "se" corner (100,50); dragging "nw" from (0,0) out to (-50,-25) is also a 1.5x scale
    expect(getVectorMultiSelectResizeScale(bounds, 'nw', 0, { x: -50, y: -25 })).toEqual({
      anchor: { x: 100, y: 50 },
      pivot: { x: 50, y: 25 },
      scaleX: 1.5,
      scaleY: 1.5,
    });
  });

  it('should leave the perpendicular axis at scale 1 (no anchor at all) for an edge handle', () => {
    // result — "e" only anchors x; y has no axis anchor and always scales 1
    expect(getVectorMultiSelectResizeScale(bounds, 'e', 0, { x: 150, y: 999 })).toEqual({
      anchor: { x: 0, y: null },
      pivot: { x: 50, y: 25 },
      scaleX: 1.5,
      scaleY: 1,
    });
  });

  it('should scale 1 (not divide by zero) when the anchored dimension is already zero-sized', () => {
    // mock — zero-width bounds: the anchor and its own opposite edge coincide, so there is nothing to
    // scale a ratio against
    const zeroWidthBounds = { height: 50, width: 0, x: 0, y: 0 };

    // result
    expect(getVectorMultiSelectResizeScale(zeroWidthBounds, 'e', 0, { x: 0, y: 0 }).scaleX).toBe(1);
  });
});

describe('getScaledVectorMultiSelectBounds', () => {
  it('should grow symmetrically from a "max"-side anchor', () => {
    // result — anchor (0,0), scaled 1.5x on both axes: new size 150x75, origin unchanged
    expect(getScaledVectorMultiSelectBounds(bounds, { x: 0, y: 0 }, 1.5, 1.5)).toEqual({ height: 75, width: 150, x: 0, y: 0 });
  });

  it('should grow from a "min"-side anchor, shifting the origin to keep that far corner fixed', () => {
    // result — anchor (100,50), scaled 1.5x: the (100,50) corner stays put, the near corner moves to (-50,-25)
    expect(getScaledVectorMultiSelectBounds(bounds, { x: 100, y: 50 }, 1.5, 1.5)).toEqual({ height: 75, width: 150, x: -50, y: -25 });
  });

  it('should leave an axis with no anchor completely untouched', () => {
    // result — no y anchor: height/y pass through exactly as given, regardless of scaleY
    expect(getScaledVectorMultiSelectBounds(bounds, { x: 0, y: null }, 1.5, 2)).toEqual({ height: 50, width: 150, x: 0, y: 0 });
  });
});

describe('getVectorMultiSelectResizeAnchorWorld', () => {
  it('should resolve a real anchor coordinate to its own rotated world position', () => {
    // result — anchor (0,0), pivot (50,25); a 90deg turn maps (0,0) to (75,-25)
    const result = getVectorMultiSelectResizeAnchorWorld(bounds, { x: 0, y: 0 }, 90);

    expect(result.x).toBeCloseTo(75);
    expect(result.y).toBeCloseTo(-25);
  });

  it('should fall back to the bounds’ own pivot x coordinate for an axis with no anchor', () => {
    // result — anchor x is null, so it falls back to the pivot's own x (50); with no rotation this is a no-op
    expect(getVectorMultiSelectResizeAnchorWorld(bounds, { x: null, y: 0 }, 0)).toEqual({ x: 50, y: 0 });
  });

  it('should fall back to the bounds’ own pivot y coordinate for an axis with no anchor', () => {
    // result — anchor y is null, so it falls back to the pivot's own y (25); with no rotation this is a no-op
    expect(getVectorMultiSelectResizeAnchorWorld(bounds, { x: 0, y: null }, 0)).toEqual({ x: 0, y: 25 });
  });
});

describe('repositionRotatedVectorMultiSelectBounds', () => {
  it('should return the scaled bounds unchanged when there is no rotation', () => {
    // result
    expect(repositionRotatedVectorMultiSelectBounds(bounds, { x: 0, y: 0 }, { x: 0, y: 0 }, 0)).toBe(bounds);
  });

  it('should reposition the scaled bounds so a real (non-null) anchor coordinate is accounted for, under rotation', () => {
    // mock — anchor (0,0) sits at offset (-50,-25) from this 100x50 box's own center (50,25); rotating
    // that offset by 90deg and solving backward from anchorWorld (0,0) shifts the box to (-75,25)
    // before
    const result = repositionRotatedVectorMultiSelectBounds(bounds, { x: 0, y: 0 }, { x: 0, y: 0 }, 90);

    // result — width/height untouched, only the position shifts
    expect(result.width).toBe(bounds.width);
    expect(result.height).toBe(bounds.height);
    expect(result.x).toBeCloseTo(-75);
    expect(result.y).toBeCloseTo(25);
  });

  it('should fall back to the scaled bounds’ own center x for an axis with no anchor, when rotated', () => {
    // mock — x has no anchor at all; anchorWorld (80,40) only needs to account for the y-side offset
    // before
    const result = repositionRotatedVectorMultiSelectBounds(bounds, { x: null, y: 0 }, { x: 80, y: 40 }, 90);

    // result
    expect(result.x).toBeCloseTo(5);
    expect(result.y).toBeCloseTo(15);
    expect(result.width).toBe(bounds.width);
    expect(result.height).toBe(bounds.height);
  });

  it('should fall back to the scaled bounds’ own center y for an axis with no anchor, when rotated', () => {
    // mock — y has no anchor at all; anchorWorld (60,30) only needs to account for the x-side offset
    // before
    const result = repositionRotatedVectorMultiSelectBounds(bounds, { x: 0, y: null }, { x: 60, y: 30 }, 90);

    // result
    expect(result.x).toBeCloseTo(10);
    expect(result.y).toBeCloseTo(55);
    expect(result.width).toBe(bounds.width);
    expect(result.height).toBe(bounds.height);
  });
});
