// utils
import { getVertexCountValueLabelAnchor } from '../getVertexCountValueLabelAnchor';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getVertexCountValueLabelAnchor', () => {
  it('should anchor just outward from the handle, along the radial line from the shape center, for an unrotated shape', () => {
    // before — the handle sits at (100, 50), straight right of the center (50, 50); the anchor sits a further 4px right
    const { anchor, direction } = getVertexCountValueLabelAnchor(BOUNDS, { x: 100, y: 50 }, 0, IDENTITY_VIEWPORT);

    // result
    expect(anchor.x).toBeCloseTo(104);
    expect(anchor.y).toBeCloseTo(50);
    expect(direction.x).toBeCloseTo(1);
    expect(direction.y).toBeCloseTo(0);
  });

  it('should scale the extra margin down as the viewport zooms in, so it stays a constant screen distance', () => {
    // before
    const zoomedOut = getVertexCountValueLabelAnchor(BOUNDS, { x: 100, y: 50 }, 0, { x: 0, y: 0, zoom: 1 });
    const zoomedIn = getVertexCountValueLabelAnchor(BOUNDS, { x: 100, y: 50 }, 0, { x: 0, y: 0, zoom: 2 });

    // result
    expect(zoomedOut.anchor.x).toBeGreaterThan(zoomedIn.anchor.x);
  });

  it('should rotate both the anchor and the outward direction together with the shape', () => {
    // before — 90deg rotation turns "right" into "down"
    const { anchor, direction } = getVertexCountValueLabelAnchor(BOUNDS, { x: 100, y: 50 }, 90, IDENTITY_VIEWPORT);

    // result
    expect(anchor.x).toBeCloseTo(50);
    expect(anchor.y).toBeCloseTo(104);
    expect(direction.x).toBeCloseTo(0);
    expect(direction.y).toBeCloseTo(1);
  });

  it('should fall back to no offset when the handle sits exactly on the center', () => {
    // before
    const { anchor, direction } = getVertexCountValueLabelAnchor(BOUNDS, { x: 50, y: 50 }, 0, IDENTITY_VIEWPORT);

    // result
    expect(anchor.x).toBeCloseTo(50);
    expect(anchor.y).toBeCloseTo(50);
    expect(direction.x).toBeCloseTo(0);
    expect(direction.y).toBeCloseTo(0);
  });
});
