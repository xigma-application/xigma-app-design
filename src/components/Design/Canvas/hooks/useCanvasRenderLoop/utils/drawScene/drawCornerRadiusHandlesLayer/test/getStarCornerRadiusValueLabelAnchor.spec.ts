// utils
import { getStarCornerRadiusHandlePosition } from 'utils/canvas/cornerRadius/star/getStarCornerRadiusHandlePosition';
import { getStarCornerRadiusValueLabelAnchor } from '../getStarCornerRadiusValueLabelAnchor';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getStarCornerRadiusValueLabelAnchor', () => {
  it('should anchor above the handle (handle position plus an extra upward margin), for an unrotated shape', () => {
    // before — the handle itself sits at the star's top point; the anchor sits a further 4px above it
    const handlePosition = getStarCornerRadiusHandlePosition(BOUNDS, 5, 0.4, 20, IDENTITY_VIEWPORT, false, false, true);
    const { anchor, direction } = getStarCornerRadiusValueLabelAnchor(BOUNDS, 5, 0.4, 20, 0, IDENTITY_VIEWPORT, false, false, true);

    // result
    expect(anchor.x).toBeCloseTo(handlePosition.x);
    expect(anchor.y).toBeCloseTo(handlePosition.y - 4);
    expect(direction.x).toBeCloseTo(0);
    expect(direction.y).toBeCloseTo(-1);
  });

  it("should track the handle's actual (inset) rest position at radius 0 while merely hovering, not dragging", () => {
    // before
    const dragging = getStarCornerRadiusValueLabelAnchor(BOUNDS, 5, 0.4, 0, 0, IDENTITY_VIEWPORT, false, false, true);
    const hovering = getStarCornerRadiusValueLabelAnchor(BOUNDS, 5, 0.4, 0, 0, IDENTITY_VIEWPORT, false, false, false);

    // result — the hovering anchor sits further from the true top point than the dragging one
    expect(hovering.anchor.y).toBeGreaterThan(dragging.anchor.y);
  });

  it('should scale the extra margin down as the viewport zooms in, so it stays a constant screen distance', () => {
    // before
    const zoomedOut = getStarCornerRadiusValueLabelAnchor(BOUNDS, 5, 0.4, 20, 0, { x: 0, y: 0, zoom: 1 }, false, false, true);
    const zoomedIn = getStarCornerRadiusValueLabelAnchor(BOUNDS, 5, 0.4, 20, 0, { x: 0, y: 0, zoom: 2 }, false, false, true);

    // result
    expect(zoomedOut.anchor.y).toBeLessThan(zoomedIn.anchor.y);
  });

  it('should rotate both the anchor and the upward direction together with the shape', () => {
    // before — 90deg rotation turns "up" into "right"
    const { direction } = getStarCornerRadiusValueLabelAnchor(BOUNDS, 5, 0.4, 20, 90, IDENTITY_VIEWPORT, false, false, true);

    // result
    expect(direction.x).toBeCloseTo(1);
    expect(direction.y).toBeCloseTo(0);
  });

  it('should account for flipX/flipY when locating the handle, same as the handle itself', () => {
    // before
    const handlePosition = getStarCornerRadiusHandlePosition(BOUNDS, 5, 0.4, 20, IDENTITY_VIEWPORT, true, true, true);
    const { anchor } = getStarCornerRadiusValueLabelAnchor(BOUNDS, 5, 0.4, 20, 0, IDENTITY_VIEWPORT, true, true, true);

    // result
    expect(anchor.x).toBeCloseTo(handlePosition.x);
    expect(anchor.y).toBeCloseTo(handlePosition.y - 4);
  });
});
