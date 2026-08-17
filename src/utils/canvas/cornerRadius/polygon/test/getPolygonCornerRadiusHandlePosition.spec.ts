// utils
import { getPolygonCornerRadiusHandlePosition } from '../getPolygonCornerRadiusHandlePosition';

const TRIANGLE_BOUNDS = { height: 100, width: 100, x: 0, y: 0 };
const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('getPolygonCornerRadiusHandlePosition', () => {
  it('should move the top vertex toward the center by the radius scaled by the setback multiplier', () => {
    // mock — top vertex of a 100x100 triangle sits at (50, 0); center is (50, 50). The tip's 60deg
    const position = getPolygonCornerRadiusHandlePosition(TRIANGLE_BOUNDS, 3, 15, IDENTITY_VIEWPORT);

    // result
    expect(position.x).toBe(50);
    expect(position.y).toBeCloseTo(30, 10);
  });

  it('should use the zero-state screen gap, converted to world units, when the radius is 0', () => {
    // mock — a bigger triangle whose max radius (50) doesn't clamp the zero-state offset
    const bigBounds = { height: 200, width: 200, x: 0, y: 0 };

    // result — ZERO_RADIUS_HANDLE_OFFSET_PX (30) / zoom (1) = 30 world units at zoom 1
    expect(getPolygonCornerRadiusHandlePosition(bigBounds, 3, 0, IDENTITY_VIEWPORT)).toEqual({ x: 100, y: 30 });
  });

  it('should clamp the zero-state offset to the polygon max setback on a shape where the offset would overshoot', () => {
    // mock — a small triangle whose max radius (10) times its setback multiplier (2) is 20, below
    const smallBounds = { height: 40, width: 40, x: 0, y: 0 };
    const position = getPolygonCornerRadiusHandlePosition(smallBounds, 3, 0, IDENTITY_VIEWPORT);

    // result
    expect(position.x).toBe(20);
    expect(position.y).toBeCloseTo(20, 10);
  });

  it('should clamp an oversized radius to the polygon max instead of overshooting past the center', () => {
    // mock — max radius for a 100x100 triangle is 25, scaled by its setback multiplier of 2
    const position = getPolygonCornerRadiusHandlePosition(TRIANGLE_BOUNDS, 3, 1000, IDENTITY_VIEWPORT);

    // result
    expect(position.x).toBe(50);
    expect(position.y).toBeCloseTo(50, 10);
  });

  it('should shrink the zero-state world offset as zoom increases, down to a screen-space floor', () => {
    // result — screen gap floors at MIN_RADIUS_HANDLE_GAP_PX (12) once 30/zoom drops below it, so at
    expect(getPolygonCornerRadiusHandlePosition(TRIANGLE_BOUNDS, 3, 0, { x: 0, y: 0, zoom: 5 })).toEqual({ x: 50, y: 2.4 });
  });

  it('should move toward the bounding-box center for a non-square polygon too', () => {
    // mock — a tall hexagon; the top vertex still sits directly above the center regardless of aspect.
    const tallBounds = { height: 200, width: 100, x: 0, y: 0 };
    const position = getPolygonCornerRadiusHandlePosition(tallBounds, 6, 10, IDENTITY_VIEWPORT);

    // result — top vertex is (50, 0), center is (50, 100), so moving toward it is purely downward
    expect(position.x).toBe(50);
    expect(position.y).toBeCloseTo(15.275252, 5);
  });

  it('should sit exactly on the top vertex at radius 0 while actively dragging, instead of jumping to the zero-state offset', () => {
    // mock — mid-drag, the handle must keep tracking the pointer down to radius 0 (right on the

    // result
    expect(getPolygonCornerRadiusHandlePosition(TRIANGLE_BOUNDS, 3, 0, IDENTITY_VIEWPORT, false, false, true)).toEqual({ x: 50, y: 0 });
  });

  it('should still use the literal (positive) radius while dragging, same as when not dragging', () => {
    // result
    expect(getPolygonCornerRadiusHandlePosition(TRIANGLE_BOUNDS, 3, 15, IDENTITY_VIEWPORT, false, false, true)).toEqual(
      getPolygonCornerRadiusHandlePosition(TRIANGLE_BOUNDS, 3, 15, IDENTITY_VIEWPORT, false, false, false),
    );
  });

  it('should flip the handle position across the bounding-box center when flipX/flipY are set', () => {
    // mock — a tall hexagon's top vertex sits at (50, 0), center at (50, 100); radius 10 moves the
    const tallBounds = { height: 200, width: 100, x: 0, y: 0 };
    const position = getPolygonCornerRadiusHandlePosition(tallBounds, 6, 10, IDENTITY_VIEWPORT, false, true);

    // result
    expect(position.x).toBe(50);
    expect(position.y).toBeCloseTo(184.724748, 5);
  });
});
