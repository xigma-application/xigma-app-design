// utils
import { getCornerRadiusValueLabelAnchor } from '../getCornerRadiusValueLabelAnchor';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getCornerRadiusValueLabelAnchor', () => {
  it('should anchor above the nw handle (handle position plus an extra upward margin), for an unrotated shape', () => {
    // before — the handle itself sits at (20, 20); the anchor sits a further 4px above it
    const { anchor, direction } = getCornerRadiusValueLabelAnchor(BOUNDS, 20, 0, IDENTITY_VIEWPORT, 'nw', true);

    // result
    expect(anchor.x).toBeCloseTo(20);
    expect(anchor.y).toBeCloseTo(16);
    expect(direction.x).toBeCloseTo(0);
    expect(direction.y).toBeCloseTo(-1);
  });

  it('should anchor below the se handle (handle position plus an extra downward margin), for an unrotated shape', () => {
    // before — the handle itself sits at (80, 80); the anchor sits a further 4px below it
    const { anchor, direction } = getCornerRadiusValueLabelAnchor(BOUNDS, 20, 0, IDENTITY_VIEWPORT, 'se', true);

    // result
    expect(anchor.x).toBeCloseTo(80);
    expect(anchor.y).toBeCloseTo(84);
    expect(direction.x).toBeCloseTo(0);
    expect(direction.y).toBeCloseTo(1);
  });

  it('should still clear the corner by the extra margin at radius 0 while dragging, where the handle itself sits right on the corner', () => {
    // before — "ne" handle sits right at the top-right corner (100, 0) when radius is 0 and isDragging is true
    const { anchor } = getCornerRadiusValueLabelAnchor(BOUNDS, 0, 0, IDENTITY_VIEWPORT, 'ne', true);

    // result
    expect(anchor.x).toBeCloseTo(100);
    expect(anchor.y).toBeCloseTo(-4);
  });

  it("should track the handle's actual (inset) rest position at radius 0 while merely hovering, not dragging", () => {
    // before — not dragging: the "ne" handle sits at its zero-state offset, not right on the corner
    const dragging = getCornerRadiusValueLabelAnchor(BOUNDS, 0, 0, IDENTITY_VIEWPORT, 'ne', true);
    const hovering = getCornerRadiusValueLabelAnchor(BOUNDS, 0, 0, IDENTITY_VIEWPORT, 'ne', false);

    // result — the hovering anchor sits further from the true corner (100, 0) than the dragging one
    expect(hovering.anchor.x).toBeLessThan(dragging.anchor.x);
    expect(hovering.anchor.y).toBeGreaterThan(dragging.anchor.y);
  });

  it('should scale the extra margin down as the viewport zooms in, so it stays a constant screen distance', () => {
    // before
    const zoomedOut = getCornerRadiusValueLabelAnchor(BOUNDS, 20, 0, { x: 0, y: 0, zoom: 1 }, 'nw', true);
    const zoomedIn = getCornerRadiusValueLabelAnchor(BOUNDS, 20, 0, { x: 0, y: 0, zoom: 2 }, 'nw', true);

    // result — at 2x zoom, the same 4 screen px is only 2 world px, so the anchor sits closer
    // to the (world-space) handle
    expect(zoomedOut.anchor.y).toBeLessThan(zoomedIn.anchor.y);
  });

  it('should rotate both the anchor and the outward direction together with the shape', () => {
    // before — 90deg rotation turns "up" (nw's outward direction) into "right"
    const { anchor, direction } = getCornerRadiusValueLabelAnchor(BOUNDS, 20, 90, IDENTITY_VIEWPORT, 'nw', true);

    // result
    expect(anchor.x).toBeCloseTo(84);
    expect(anchor.y).toBeCloseTo(20);
    expect(direction.x).toBeCloseTo(1);
    expect(direction.y).toBeCloseTo(0);
  });
});
