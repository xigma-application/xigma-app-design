// types
import { SizingMode } from 'types/design/enums';

// utils
import { getGridTrackAffordanceHoveredHandlePart } from '../getGridTrackAffordanceHoveredHandlePart';

const getGlyphQuadBoundsMock = vi.fn();

vi.mock('utils/canvas/text/getGlyphQuadBounds', () => ({
  getGlyphQuadBounds: (...args: unknown[]): unknown => getGlyphQuadBoundsMock(...args),
}));

const PILL_CENTER = { x: 100, y: 50 };
const BOUNDS = { maxX: 10, maxY: 5, minX: -10, minY: -5 };

describe('getGridTrackAffordanceHoveredHandlePart', () => {
  beforeEach(() => {
    getGlyphQuadBoundsMock.mockReset().mockReturnValue(BOUNDS);
  });

  it('should return null when the text produces no glyphs', () => {
    getGlyphQuadBoundsMock.mockReturnValue(null);

    const part = getGridTrackAffordanceHoveredHandlePart(PILL_CENTER, PILL_CENTER, { mode: SizingMode.fill, value: 1 }, 100, 1);

    expect(part).toBeNull();
  });

  it('should return grip when the point sits in the left band of the expanded badge', () => {
    const part = getGridTrackAffordanceHoveredHandlePart(
      { x: PILL_CENTER.x - 20, y: PILL_CENTER.y },
      PILL_CENTER,
      { mode: SizingMode.fill, value: 1 },
      100,
      1,
    );

    expect(part).toBe('grip');
  });

  it('should return chevron when the point sits in the right band of the expanded badge', () => {
    const part = getGridTrackAffordanceHoveredHandlePart(
      { x: PILL_CENTER.x + 20, y: PILL_CENTER.y },
      PILL_CENTER,
      { mode: SizingMode.fill, value: 1 },
      100,
      1,
    );

    expect(part).toBe('chevron');
  });

  it('should return value in the middle band, formatting the text from the track mode/value', () => {
    const part = getGridTrackAffordanceHoveredHandlePart(PILL_CENTER, PILL_CENTER, { mode: SizingMode.fill, value: 1 }, 100, 1);

    expect(part).toBe('value');
  });

  it('should return null when the point is outside the badge entirely', () => {
    const part = getGridTrackAffordanceHoveredHandlePart(
      { x: PILL_CENTER.x, y: PILL_CENTER.y + 100 },
      PILL_CENTER,
      { mode: SizingMode.fill, value: 1 },
      100,
      1,
    );

    expect(part).toBeNull();
  });
});
