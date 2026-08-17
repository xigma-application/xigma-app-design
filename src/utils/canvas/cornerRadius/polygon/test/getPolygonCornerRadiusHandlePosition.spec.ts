// utils
import { getPolygonCornerRadiusHandlePosition } from '../getPolygonCornerRadiusHandlePosition';

const TRIANGLE_BOUNDS = { height: 100, width: 100, x: 0, y: 0 };
const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('getPolygonCornerRadiusHandlePosition', () => {
  it('should move the top vertex toward the center by exactly the corner radius when it is positive', () => {
    // result — top vertex of a 100x100 triangle sits at (50, 0); center is (50, 50)
    expect(getPolygonCornerRadiusHandlePosition(TRIANGLE_BOUNDS, 3, 15, IDENTITY_VIEWPORT)).toEqual({ x: 50, y: 15 });
  });

  it('should use the zero-state screen gap, converted to world units, when the radius is 0', () => {
    // mock — a bigger triangle whose max radius (50) doesn't clamp the zero-state offset
    const bigBounds = { height: 200, width: 200, x: 0, y: 0 };

    // result — ZERO_RADIUS_HANDLE_OFFSET_PX (30) / zoom (1) = 30 world units at zoom 1
    expect(getPolygonCornerRadiusHandlePosition(bigBounds, 3, 0, IDENTITY_VIEWPORT)).toEqual({ x: 100, y: 30 });
  });

  it('should clamp the zero-state offset to the polygon max radius on a shape where the offset would overshoot', () => {
    // mock — the max radius for a 100x100 triangle is 25, below the 30px zero-state offset
    const position = getPolygonCornerRadiusHandlePosition(TRIANGLE_BOUNDS, 3, 0, IDENTITY_VIEWPORT);

    // result
    expect(position.x).toBe(50);
    expect(position.y).toBeCloseTo(25, 10);
  });

  it('should clamp an oversized radius to the polygon max instead of overshooting past the center', () => {
    // mock — max radius for a 100x100 triangle is 25
    const position = getPolygonCornerRadiusHandlePosition(TRIANGLE_BOUNDS, 3, 1000, IDENTITY_VIEWPORT);

    // result
    expect(position.x).toBe(50);
    expect(position.y).toBeCloseTo(25, 10);
  });

  it('should shrink the zero-state world offset as zoom increases, down to a screen-space floor', () => {
    // result — screen gap floors at MIN_RADIUS_HANDLE_GAP_PX (12) once 30/zoom drops below it, so at
    // zoom 5 the gap is 12 screen px = 2.4 world units, not 30/5 = 6 world units
    expect(getPolygonCornerRadiusHandlePosition(TRIANGLE_BOUNDS, 3, 0, { x: 0, y: 0, zoom: 5 })).toEqual({ x: 50, y: 2.4 });
  });

  it('should move toward the bounding-box center for a non-square polygon too', () => {
    // mock — a tall hexagon; the top vertex still sits directly above the center regardless of aspect
    const tallBounds = { height: 200, width: 100, x: 0, y: 0 };

    // result — top vertex is (50, 0), center is (50, 100), so moving toward it is purely downward
    expect(getPolygonCornerRadiusHandlePosition(tallBounds, 6, 10, IDENTITY_VIEWPORT)).toEqual({ x: 50, y: 10 });
  });

  it('should sit exactly on the top vertex at radius 0 while actively dragging, instead of jumping to the zero-state offset', () => {
    // mock — mid-drag, the handle must keep tracking the pointer down to radius 0 (right on the
    // vertex itself) rather than snapping out to the zero-state gap the moment it hits 0
    // result
    expect(getPolygonCornerRadiusHandlePosition(TRIANGLE_BOUNDS, 3, 0, IDENTITY_VIEWPORT, true)).toEqual({ x: 50, y: 0 });
  });

  it('should still use the literal (positive) radius while dragging, same as when not dragging', () => {
    // result
    expect(getPolygonCornerRadiusHandlePosition(TRIANGLE_BOUNDS, 3, 15, IDENTITY_VIEWPORT, true)).toEqual(
      getPolygonCornerRadiusHandlePosition(TRIANGLE_BOUNDS, 3, 15, IDENTITY_VIEWPORT, false),
    );
  });
});
