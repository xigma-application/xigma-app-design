// utils
import { getValueLabelBadgeGeometry } from '../getValueLabelBadgeGeometry';

// a glyph bounds box 12 wide x 18 tall, centered at its own local origin
const BOUNDS = { maxX: 6, maxY: 9, minX: -6, minY: -9 };
const UP = { x: 0, y: -1 };

describe('getValueLabelBadgeGeometry', () => {
  it('should size the badge to the glyph bounds plus padding on every side', () => {
    // before
    const geometry = getValueLabelBadgeGeometry(BOUNDS, { x: 100, y: 100 }, UP, 5, 3, 28, undefined, 1);

    // result
    expect(geometry.badgeWidth).toBe(22);
    expect(geometry.badgeHeight).toBe(24);
  });

  it('should offset the center from the anchor along the offset direction by the default offset when no edge gap is given', () => {
    // before
    const geometry = getValueLabelBadgeGeometry(BOUNDS, { x: 100, y: 100 }, UP, 5, 3, 28, undefined, 1);

    // result — 28px straight up from the anchor
    expect(geometry.center).toEqual({ x: 100, y: 72 });
  });

  it('should follow a sideways offset direction just as well, staying on the same axis as the anchor', () => {
    // before
    const geometry = getValueLabelBadgeGeometry(BOUNDS, { x: 100, y: 100 }, { x: 1, y: 0 }, 5, 3, 28, undefined, 1);

    // result
    expect(geometry.center).toEqual({ x: 128, y: 100 });
  });

  it('should sit a fixed screen-px gap off the edge when edgeGapPx is given, ignoring the default offset', () => {
    // before — badge is 24 tall, so a 5px edge gap puts the centre 17px out (5 + 24/2)
    const geometry = getValueLabelBadgeGeometry(BOUNDS, { x: 100, y: 100 }, UP, 5, 3, 28, 5, 1);

    // result
    expect(geometry.center).toEqual({ x: 100, y: 83 });
  });

  it('should shrink the badge and its edge gap together as the viewport zooms in', () => {
    // before — zoomed in 2x: the edge gap in world units halves
    const geometry = getValueLabelBadgeGeometry(BOUNDS, { x: 100, y: 100 }, UP, 5, 3, 28, 5, 2);

    // result — 2.5px gap (5px / zoom 2) + 24/2 badge half-height
    expect(geometry.center).toEqual({ x: 100, y: 85.5 });
  });
});
