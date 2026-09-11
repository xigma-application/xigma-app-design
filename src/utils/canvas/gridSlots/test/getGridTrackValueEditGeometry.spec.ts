// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getGridTrackValueEditGeometry } from '../getGridTrackValueEditGeometry';

const getGlyphQuadBoundsMock = vi.fn();

vi.mock('utils/canvas/text/getGlyphQuadBounds', () => ({
  getGlyphQuadBounds: (...args: unknown[]): unknown => getGlyphQuadBoundsMock(...args),
}));

const PILL_CENTER = { x: 100, y: 50 };

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#fff',
    height: 200,
    id: 'frame-1',
    layoutMode: LayoutMode.grid,
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 400,
    x: 0,
    y: 0,
    ...overrides,
  }) as TFrameNode;

describe('getGridTrackValueEditGeometry', () => {
  beforeEach(() => {
    getGlyphQuadBoundsMock.mockReset();
  });

  it('should return null when the text produces no glyphs', () => {
    getGlyphQuadBoundsMock.mockReturnValue(null);

    const geometry = getGridTrackValueEditGeometry(PILL_CENTER, '', 1, frame());

    expect(geometry).toBeNull();
  });

  it('should return a finite center and positive badge size for short text', () => {
    getGlyphQuadBoundsMock.mockReturnValue({ maxX: 10, maxY: 5, minX: -10, minY: -5 });

    const geometry = getGridTrackValueEditGeometry(PILL_CENTER, '1fr', 1, frame());

    expect(geometry).not.toBeNull();
    expect(Number.isFinite(geometry!.center.x)).toBe(true);
    expect(Number.isFinite(geometry!.center.y)).toBe(true);
    expect(geometry!.badgeWidth).toBeGreaterThan(0);
    expect(geometry!.badgeHeight).toBeGreaterThan(0);
  });

  it('should cap the value width at the 100px screen maximum, however long the typed text is', () => {
    // a wildly long text — natural width would blow well past the cap at zoom 1
    getGlyphQuadBoundsMock.mockReturnValue({ maxX: 5000, maxY: 5, minX: -5000, minY: -5 });

    const geometry = getGridTrackValueEditGeometry(PILL_CENTER, '99999999999999', 1, frame());

    expect(geometry!.badgeWidth).toBeLessThanOrEqual(100);
  });

  it('should scale the same 100px cap down in world units as the viewport zooms in', () => {
    getGlyphQuadBoundsMock.mockReturnValue({ maxX: 5000, maxY: 5, minX: -5000, minY: -5 });

    const zoomedOut = getGridTrackValueEditGeometry(PILL_CENTER, 'x', 1, frame());
    const zoomedIn = getGridTrackValueEditGeometry(PILL_CENTER, 'x', 2, frame());

    expect(zoomedIn!.badgeWidth).toBeLessThan(zoomedOut!.badgeWidth);
  });

  it('should not clamp text that already fits comfortably under the cap', () => {
    getGlyphQuadBoundsMock.mockReturnValue({ maxX: 5, maxY: 5, minX: -5, minY: -5 });

    const geometry = getGridTrackValueEditGeometry(PILL_CENTER, '5', 1, frame());

    expect(geometry!.badgeWidth).toBeLessThan(100);
  });

  it('should anchor a rotated frame at a different centre than an unrotated one', () => {
    getGlyphQuadBoundsMock.mockReturnValue({ maxX: 10, maxY: 5, minX: -10, minY: -5 });

    const straight = getGridTrackValueEditGeometry(PILL_CENTER, '1fr', 1, frame({ rotation: 0 }));
    const rotated = getGridTrackValueEditGeometry(PILL_CENTER, '1fr', 1, frame({ rotation: 90 }));

    expect(rotated!.center).not.toEqual(straight!.center);
  });
});
