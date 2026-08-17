// utils
import { getStarCornerRadiusHandlePosition } from '../getStarCornerRadiusHandlePosition';

const STAR_BOUNDS = { height: 100, width: 100, x: 0, y: 0 };
const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('getStarCornerRadiusHandlePosition', () => {
  it('should move the top outer vertex toward the center by the radius scaled by the vertex-angle setback multiplier', () => {
    // mock — top vertex of a 100x100 5-point star sits at (50, 0); center is (50, 50). The tip's
    const position = getStarCornerRadiusHandlePosition(STAR_BOUNDS, 5, 0.5, 10, IDENTITY_VIEWPORT);

    // result
    expect(position.x).toBe(50);
    expect(position.y).toBeCloseTo(22.595515, 5);
  });

  it('should use the zero-state screen gap, converted to world units, when the radius is 0', () => {
    // mock — a bigger star whose max setback doesn't clamp the zero-state offset
    const bigBounds = { height: 400, width: 400, x: 0, y: 0 };

    // result — ZERO_RADIUS_HANDLE_OFFSET_PX (30) / zoom (1) = 30 world units at zoom 1; the
    expect(getStarCornerRadiusHandlePosition(bigBounds, 5, 0.5, 0, IDENTITY_VIEWPORT)).toEqual({ x: 200, y: 30 });
  });

  it('should clamp the zero-state offset to the star max setback on a shape where the offset would overshoot', () => {
    // mock — the max radius for this 100x100 5-point star at ratio 0.5 is ~13.01, which scaled by
    const position = getStarCornerRadiusHandlePosition(STAR_BOUNDS, 5, 0.5, 0, IDENTITY_VIEWPORT);

    // result
    expect(position.x).toBe(50);
    expect(position.y).toBeCloseTo(29.398867, 5);
  });

  it('should clamp an oversized radius to the star max setback instead of overshooting past the center', () => {
    // before
    const position = getStarCornerRadiusHandlePosition(STAR_BOUNDS, 5, 0.5, 1000, IDENTITY_VIEWPORT);

    // result
    expect(position.x).toBe(50);
    expect(position.y).toBeCloseTo(29.398867, 5);
  });

  it('should sit exactly on the top vertex at radius 0 while actively dragging, instead of jumping to the zero-state offset', () => {
    // result
    expect(getStarCornerRadiusHandlePosition(STAR_BOUNDS, 5, 0.5, 0, IDENTITY_VIEWPORT, true)).toEqual({ x: 50, y: 0 });
  });

  it('should still use the literal (positive) radius, scaled by the setback multiplier, while dragging, same as when not dragging', () => {
    // result
    expect(getStarCornerRadiusHandlePosition(STAR_BOUNDS, 5, 0.5, 10, IDENTITY_VIEWPORT, true)).toEqual(
      getStarCornerRadiusHandlePosition(STAR_BOUNDS, 5, 0.5, 10, IDENTITY_VIEWPORT, false),
    );
  });
});
