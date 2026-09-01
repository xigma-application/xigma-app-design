// utils
import { getEllipseArcValueLabelAnchor } from '../getEllipseArcValueLabelAnchor';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };
const DIAGONAL = Math.SQRT1_2; // cos(45°) === sin(45°)

describe('getEllipseArcValueLabelAnchor', () => {
  it('should anchor at a fixed 45° up-and-to-the-right offset from the handle, for an unrotated shape', () => {
    // before — the handle sits at (100, 50), straight right of the center (50, 50)
    const { anchor, direction } = getEllipseArcValueLabelAnchor(BOUNDS, { x: 100, y: 50 }, 0, IDENTITY_VIEWPORT);

    // result
    expect(anchor.x).toBeCloseTo(100 + 4 * DIAGONAL);
    expect(anchor.y).toBeCloseTo(50 - 4 * DIAGONAL);
    expect(direction.x).toBeCloseTo(DIAGONAL);
    expect(direction.y).toBeCloseTo(-DIAGONAL);
  });

  it('should use the same fixed 45° direction no matter where the handle sits on the ellipse — not radially outward from the center', () => {
    // before — the handle now sits at (50, 0), straight above the center; the old radial behavior would have pointed "up" here
    const { direction } = getEllipseArcValueLabelAnchor(BOUNDS, { x: 50, y: 0 }, 0, IDENTITY_VIEWPORT);

    // result — same direction as the "right-side handle" case above
    expect(direction.x).toBeCloseTo(DIAGONAL);
    expect(direction.y).toBeCloseTo(-DIAGONAL);
  });

  it('should scale the extra margin down as the viewport zooms in, so it stays a constant screen distance', () => {
    // before
    const zoomedOut = getEllipseArcValueLabelAnchor(BOUNDS, { x: 100, y: 50 }, 0, { x: 0, y: 0, zoom: 1 });
    const zoomedIn = getEllipseArcValueLabelAnchor(BOUNDS, { x: 100, y: 50 }, 0, { x: 0, y: 0, zoom: 2 });

    // result — at 2x zoom, the same 4 screen px is only 2 world px, so the anchor sits closer to the (world-space) handle
    expect(zoomedOut.anchor.x).toBeGreaterThan(zoomedIn.anchor.x);
  });

  it('should rotate both the anchor and the 45° direction together with the shape', () => {
    // before — 90deg rotation turns the up-right diagonal into a down-right diagonal
    const { anchor, direction } = getEllipseArcValueLabelAnchor(BOUNDS, { x: 100, y: 50 }, 90, IDENTITY_VIEWPORT);

    // result
    expect(anchor.x).toBeCloseTo(50 + 4 * DIAGONAL);
    expect(anchor.y).toBeCloseTo(100 + 4 * DIAGONAL);
    expect(direction.x).toBeCloseTo(DIAGONAL);
    expect(direction.y).toBeCloseTo(DIAGONAL);
  });

  it('should still apply the fixed 45° offset even when the handle sits exactly on the center (degenerate zero-radius shape)', () => {
    // before
    const { anchor, direction } = getEllipseArcValueLabelAnchor(BOUNDS, { x: 50, y: 50 }, 0, IDENTITY_VIEWPORT);

    // result
    expect(anchor.x).toBeCloseTo(50 + 4 * DIAGONAL);
    expect(anchor.y).toBeCloseTo(50 - 4 * DIAGONAL);
    expect(direction.x).toBeCloseTo(DIAGONAL);
    expect(direction.y).toBeCloseTo(-DIAGONAL);
  });
});
