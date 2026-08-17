// utils
import { getCornerRadiusHandlePositions } from '../getCornerRadiusHandlePositions';

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('getCornerRadiusHandlePositions', () => {
  it('should inset each corner by exactly the corner radius when it is positive', () => {
    // result
    expect(getCornerRadiusHandlePositions(bounds, 15, IDENTITY_VIEWPORT)).toEqual({
      ne: { x: 85, y: 15 },
      nw: { x: 15, y: 15 },
      se: { x: 85, y: 85 },
      sw: { x: 15, y: 85 },
    });
  });

  it('should use the zero-state screen gap, converted to world units, when the radius is 0', () => {
    // result — ZERO_RADIUS_HANDLE_OFFSET_PX (30) / zoom (1) = 30 world units at zoom 1
    expect(getCornerRadiusHandlePositions(bounds, 0, IDENTITY_VIEWPORT)).toEqual({
      ne: { x: 70, y: 30 },
      nw: { x: 30, y: 30 },
      se: { x: 70, y: 70 },
      sw: { x: 30, y: 70 },
    });
  });

  it('should shrink the zero-state world offset as zoom increases, down to a screen-space floor', () => {
    // result — screen gap floors at MIN_RADIUS_HANDLE_GAP_PX (12) once 30/zoom drops below it, so at
    // zoom 5 the gap is 12 screen px = 2.4 world units, not 30/5 = 6 world units
    expect(getCornerRadiusHandlePositions(bounds, 0, { x: 0, y: 0, zoom: 5 })).toEqual({
      ne: { x: 97.6, y: 2.4 },
      nw: { x: 2.4, y: 2.4 },
      se: { x: 97.6, y: 97.6 },
      sw: { x: 2.4, y: 97.6 },
    });
  });

  it('should stay pinned to a fixed screen distance from the corner once zoom drops below 100%, instead of marching toward the center', () => {
    // mock — a 1000x1000 shape stays well clear of its own max-radius clamp (500) at this zoom
    const largeBounds = { height: 1000, width: 1000, x: 0, y: 0 };

    // result — screen gap ceilings at ZERO_RADIUS_HANDLE_OFFSET_PX (30) instead of growing to 30/0.1
    expect(getCornerRadiusHandlePositions(largeBounds, 0, { x: 0, y: 0, zoom: 0.1 })).toEqual({
      ne: { x: 700, y: 300 },
      nw: { x: 300, y: 300 },
      se: { x: 700, y: 700 },
      sw: { x: 300, y: 700 },
    });
  });

  it('should clamp the zero-state offset to the max corner radius on a small shape when zoomed far out', () => {
    // mock — a tiny 10x10 shape has a max radius of 5; a far-out zoom would otherwise blow the
    // zero-state offset well past that
    const smallBounds = { height: 10, width: 10, x: 0, y: 0 };

    // result
    expect(getCornerRadiusHandlePositions(smallBounds, 0, { x: 0, y: 0, zoom: 0.1 })).toEqual({
      ne: { x: 5, y: 5 },
      nw: { x: 5, y: 5 },
      se: { x: 5, y: 5 },
      sw: { x: 5, y: 5 },
    });
  });
});
