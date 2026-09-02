// utils
import { getPolygonCornerRadiusHandlePosition } from 'utils/canvas/cornerRadius/polygon/getPolygonCornerRadiusHandlePosition';
import { getPolygonCornerRadiusValueLabelAnchor } from '../getPolygonCornerRadiusValueLabelAnchor';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getPolygonCornerRadiusValueLabelAnchor', () => {
  it('should anchor above the handle (handle position plus an extra upward margin), for an unrotated shape', () => {
    // before — the handle itself sits at the polygon's top vertex; the anchor sits a further 4px above it
    const handlePosition = getPolygonCornerRadiusHandlePosition(BOUNDS, 5, 20, IDENTITY_VIEWPORT, false, false, true);
    const { anchor, direction } = getPolygonCornerRadiusValueLabelAnchor(BOUNDS, 5, 20, 0, IDENTITY_VIEWPORT, false, false, true);

    // result
    expect(anchor.x).toBeCloseTo(handlePosition.x);
    expect(anchor.y).toBeCloseTo(handlePosition.y - 4);
    expect(direction.x).toBeCloseTo(0);
    expect(direction.y).toBeCloseTo(-1);
  });

  it('should track the handle\'s actual (inset) rest position at radius 0 while merely hovering, not dragging', () => {
    // before — not dragging: the handle sits at its zero-state offset from the top vertex, not right on it
    const dragging = getPolygonCornerRadiusValueLabelAnchor(BOUNDS, 5, 0, 0, IDENTITY_VIEWPORT, false, false, true);
    const hovering = getPolygonCornerRadiusValueLabelAnchor(BOUNDS, 5, 0, 0, IDENTITY_VIEWPORT, false, false, false);

    // result — the hovering anchor sits further from the true top vertex (50, 0) than the dragging one
    expect(hovering.anchor.y).toBeGreaterThan(dragging.anchor.y);
  });

  it('should scale the extra margin down as the viewport zooms in, so it stays a constant screen distance', () => {
    // before
    const zoomedOut = getPolygonCornerRadiusValueLabelAnchor(BOUNDS, 5, 20, 0, { x: 0, y: 0, zoom: 1 }, false, false, true);
    const zoomedIn = getPolygonCornerRadiusValueLabelAnchor(BOUNDS, 5, 20, 0, { x: 0, y: 0, zoom: 2 }, false, false, true);

    // result — at 2x zoom, the same 4 screen px is only 2 world px, so the anchor sits closer
    // to the (world-space) handle
    expect(zoomedOut.anchor.y).toBeLessThan(zoomedIn.anchor.y);
  });

  it('should rotate both the anchor and the upward direction together with the shape', () => {
    // before — 90deg rotation turns "up" into "right"
    const { direction } = getPolygonCornerRadiusValueLabelAnchor(BOUNDS, 5, 20, 90, IDENTITY_VIEWPORT, false, false, true);

    // result
    expect(direction.x).toBeCloseTo(1);
    expect(direction.y).toBeCloseTo(0);
  });

  it('should account for flipX/flipY when locating the handle, same as the handle itself', () => {
    // before
    const handlePosition = getPolygonCornerRadiusHandlePosition(BOUNDS, 5, 20, IDENTITY_VIEWPORT, true, true, true);
    const { anchor } = getPolygonCornerRadiusValueLabelAnchor(BOUNDS, 5, 20, 0, IDENTITY_VIEWPORT, true, true, true);

    // result
    expect(anchor.x).toBeCloseTo(handlePosition.x);
    expect(anchor.y).toBeCloseTo(handlePosition.y - 4);
  });
});
