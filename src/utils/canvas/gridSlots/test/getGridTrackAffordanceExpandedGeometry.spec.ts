// utils
import { getGridTrackAffordanceExpandedGeometry } from '../getGridTrackAffordanceExpandedGeometry';

const CENTER = { x: 100, y: 50 };
// width 20, height 14 — tall enough that the text, not the 6px grip/chevron icons, drives the badge height
const BOUNDS = { maxX: 10, maxY: 7, minX: -10, minY: -7 };

describe('getGridTrackAffordanceExpandedGeometry', () => {
  it('should size the badge to fit the grip, the text and the chevron with padding between and around them', () => {
    const geometry = getGridTrackAffordanceExpandedGeometry(CENTER, BOUNDS, 1);

    // grip 5 + gap 5 + text 20 + gap 5 + chevron 6 + padding 5*2
    expect(geometry.badgeWidth).toBeCloseTo(51, 5);
    // tallest content is the text (14) here, plus padding 3*2
    expect(geometry.badgeHeight).toBeCloseTo(20, 5);
  });

  it('should grow the badge height to fit the grip/chevron icons when the text is shorter than them', () => {
    const shortTextBounds = { maxX: 1, maxY: 0.5, minX: -1, minY: -0.5 };

    const geometry = getGridTrackAffordanceExpandedGeometry(CENTER, shortTextBounds, 1);

    expect(geometry.badgeHeight).toBeCloseTo(6 + 6, 5);
  });

  it('should lay out the grip, text and chevron centers left-to-right, centered on the given point vertically', () => {
    const geometry = getGridTrackAffordanceExpandedGeometry(CENTER, BOUNDS, 1);
    const leftEdge = CENTER.x - geometry.badgeWidth / 2;

    expect(geometry.gripCenter).toEqual({ x: leftEdge + 5 + 2.5, y: 50 });
    expect(geometry.textCenter.x).toBeGreaterThan(geometry.gripCenter.x);
    expect(geometry.chevronCenter.x).toBeGreaterThan(geometry.textCenter.x);
    expect(geometry.textCenter.y).toBe(50);
    expect(geometry.chevronCenter.y).toBe(50);
  });

  it('should shrink every screen-constant size in local units as the viewport zooms in', () => {
    const zoomedOut = getGridTrackAffordanceExpandedGeometry(CENTER, BOUNDS, 1);
    const zoomedIn = getGridTrackAffordanceExpandedGeometry(CENTER, BOUNDS, 2);

    expect(zoomedIn.badgeWidth).toBeLessThan(zoomedOut.badgeWidth);
    expect(zoomedIn.badgeHeight).toBeLessThan(zoomedOut.badgeHeight);
  });
});
