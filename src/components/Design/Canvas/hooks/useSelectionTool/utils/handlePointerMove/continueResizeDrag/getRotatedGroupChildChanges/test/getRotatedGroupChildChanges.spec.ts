// utils
import { getRotatedGroupChildChanges } from '../getRotatedGroupChildChanges';

describe('getRotatedGroupChildChanges', () => {
  it('should map a box child linearly into the resized box for a non-rotated group', () => {
    // action
    const changes = getRotatedGroupChildChanges(
      { flip: null, height: 20, rotation: 0, width: 20, x: 40, y: 40 },
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { height: 100, width: 200, x: 0, y: 0 },
    );

    // result
    expect(changes).toMatchObject({ height: 20, width: 40, x: 80, y: 40 });
  });

  it('should keep a child at the group center at the new center for any rotation', () => {
    // action
    const changes = getRotatedGroupChildChanges(
      { flip: null, height: 20, rotation: 35, width: 20, x: 40, y: 40 },
      { height: 100, width: 100, x: 0, y: 0 },
      35,
      { height: 140, width: 60, x: 20, y: -20 },
    );

    // result
    const { height, width, x, y } = changes as { height: number; width: number; x: number; y: number };
    expect(x + width / 2).toBeCloseTo(50, 4);
    expect(y + height / 2).toBeCloseTo(50, 4);
  });

  it('should scale a line child endpoint-wise', () => {
    // action
    const changes = getRotatedGroupChildChanges({ x1: 0, x2: 100, y1: 50, y2: 50 }, { height: 100, width: 100, x: 0, y: 0 }, 0, {
      height: 100,
      width: 200,
      x: 0,
      y: 0,
    });

    // result
    expect(changes).toEqual({ x1: 0, x2: 200, y1: 50, y2: 50 });
  });

  it('should scale a vector child vertex-wise', () => {
    // action
    const changes = getRotatedGroupChildChanges(
      { rotation: 0, segments: {}, vertices: { v1: { x: 0, y: 50 }, v2: { x: 100, y: 50 } } },
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { height: 100, width: 200, x: 0, y: 0 },
    );

    // result
    const { vertices } = changes as { vertices: Record<string, { x: number; y: number }> };
    expect(vertices.v1.x).toBeCloseTo(0, 4);
    expect(vertices.v2.x).toBeCloseTo(200, 4);
  });

  it('should mirror a box child across the box when the resize crosses the anchor', () => {
    // action — right edge (x=100) fixed, left edge dragged past it: box flips to x=100..130
    const changes = getRotatedGroupChildChanges(
      { flip: null, height: 20, rotation: 0, width: 20, x: 10, y: 40 },
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { height: 100, width: 30, x: 100, y: 0 },
    );

    // result — was near the old left edge (u=0.2), now sits near the new box's right side
    const { width, x } = changes as { width: number; x: number };
    expect(width).toBe(6);
    expect(x + width / 2).toBeCloseTo(124, 4);
  });

  it('should mirror only the vertical axis when the resize crosses the bottom anchor', () => {
    // action — bottom edge (y=100) fixed, top edge dragged past it: box flips to y=100..130
    const changes = getRotatedGroupChildChanges(
      { flip: null, height: 20, rotation: 0, width: 20, x: 40, y: 10 },
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { height: 30, width: 100, x: 0, y: 100 },
    );

    // result — was near the old top edge (v=0.1), now sits near the new box's bottom side
    const { height, y } = changes as { height: number; y: number };
    expect(height).toBe(6);
    expect(y + height / 2).toBeCloseTo(124, 4);
  });

  it('should toggle flipX on a flippable child when the resize mirrors its axis', () => {
    // action
    const changes = getRotatedGroupChildChanges(
      { flip: { x: false, y: false }, height: 20, rotation: 0, width: 20, x: 40, y: 40 },
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { height: 100, width: 30, x: 100, y: 0 },
    );

    // result
    expect(changes).toMatchObject({ flipX: true, flipY: false });
  });

  it('should keep the current flip state when neither axis mirrors', () => {
    // action
    const changes = getRotatedGroupChildChanges(
      { flip: { x: true, y: false }, height: 20, rotation: 0, width: 20, x: 40, y: 40 },
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { height: 100, width: 200, x: 0, y: 0 },
    );

    // result
    expect(changes).toMatchObject({ flipX: true, flipY: false });
  });

  it('should swap which axis a rotated child mirrors on', () => {
    // action — child rotated 90 degrees relative to the (unrotated) group
    const changes = getRotatedGroupChildChanges(
      { flip: { x: false, y: false }, height: 20, rotation: 90, width: 20, x: 10, y: 40 },
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { height: 100, width: 30, x: 100, y: 0 },
    );

    // result
    expect(changes).toMatchObject({ flipX: false, flipY: true });
  });

  it('should fall back to a fraction of 0.5 when the origin box has zero size', () => {
    // action
    const changes = getRotatedGroupChildChanges(
      { flip: null, height: 20, rotation: 0, width: 20, x: 40, y: 40 },
      { height: 0, width: 0, x: 25, y: 25 },
      0,
      { height: 50, width: 50, x: 0, y: 0 },
    );

    // result
    expect(changes).toMatchObject({ height: 20, width: 20 });
  });
});
