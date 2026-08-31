// utils
import { getCurvedCaretQuadCorners } from '../getCurvedCaretQuadCorners';

const BOX = { flipX: false, flipY: false, height: 100, rotation: 0, width: 100, x: 0, y: 0 };
const ANCHOR = { angleDegrees: 0, x: 70, y: 70 };

describe('getCurvedCaretQuadCorners', () => {
  it('should build a plain axis-aligned box around the anchor when unrotated and unflipped', () => {
    // result — top edge `ascent` above the anchor, bottom edge `descent` below it
    expect(getCurvedCaretQuadCorners(ANCHOR, 6, 10, 4, BOX)).toEqual([
      { x: 67, y: 60 },
      { x: 73, y: 60 },
      { x: 73, y: 74 },
      { x: 67, y: 74 },
    ]);
  });

  it('should swap the ascent/descent sides across the anchor when flipped vertically — a true mirror, not a 180° spin', () => {
    // before — same anchor/ascent/descent as above, flipY true
    const corners = getCurvedCaretQuadCorners(ANCHOR, 6, 10, 4, { ...BOX, flipY: true });

    // result — the flipped anchor sits at (70, 30); the corner that was 10px *above* the anchor
    // (ascent) is now 10px *below* the flipped anchor, and the one 4px below (descent) is now 4px
    // above — the ascent/descent split flips sides, it doesn't just rotate along with everything else
    expect(corners).toEqual([
      { x: 67, y: 40 },
      { x: 73, y: 40 },
      { x: 73, y: 26 },
      { x: 67, y: 26 },
    ]);
  });

  it('should leave the ascent/descent split untouched by a horizontal-only flip on a horizontal (0°) tangent', () => {
    // before — flipX only, angle 0: the mirror runs along the same axis the caret's own width does,
    // so its perpendicular ascent/descent extent shouldn't move at all
    const corners = getCurvedCaretQuadCorners(ANCHOR, 6, 10, 4, { ...BOX, flipX: true });

    // result — same y-coordinates as the unflipped case (60/60/74/74), only x mirrored
    expect(corners.map((corner) => corner.y)).toEqual([60, 60, 74, 74]);
  });

  it('should rotate the whole quad around the box centre for a rotated box, preserving each corner’s own distance from the anchor', () => {
    // before — the unrotated case's own corner distances from the anchor (70,70): the two
    // ascent-side corners sit sqrt(3²+10²) away, the two descent-side ones sqrt(3²+4²) away
    const unrotatedDistances = [Math.hypot(3, 10), Math.hypot(3, 10), Math.hypot(3, 4), Math.hypot(3, 4)];

    // before — 90° box rotation around centre (50,50); the anchor (70,70) maps to (30,70)
    const corners = getCurvedCaretQuadCorners(ANCHOR, 6, 10, 4, { ...BOX, rotation: 90 });

    // result — every corner keeps its own original distance from the (now-rotated) anchor
    corners.forEach((corner, index) => {
      expect(Math.hypot(corner.x - 30, corner.y - 70)).toBeCloseTo(unrotatedDistances[index], 5);
    });
  });
});
