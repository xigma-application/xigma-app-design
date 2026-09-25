// utils
import { getGridTrackValueEditBounds } from '../getGridTrackValueEditBounds';

const boundsMock = vi.fn();

vi.mock('utils/canvas/text/buildGlyphQuads', () => ({ buildGlyphQuads: (): number[] => [] }));
vi.mock('utils/canvas/text/getGlyphQuadBounds', () => ({ getGlyphQuadBounds: (...args: unknown[]): unknown => boundsMock(...args) }));

describe('getGridTrackValueEditBounds', () => {
  it('should pad the text bounds on both sides for editing', () => {
    // mock
    boundsMock.mockReturnValue({ maxX: 40, maxY: 5, minX: 10, minY: -5 });

    // result
    expect(getGridTrackValueEditBounds('120', 1)).toEqual({ maxX: 43, maxY: 5, minX: 7, minY: -5 });
  });

  it('should cap overly long text at the maximum width, scaled by zoom', () => {
    // mock
    boundsMock.mockReturnValue({ maxX: 200, maxY: 5, minX: 0, minY: -5 });

    // result
    expect(getGridTrackValueEditBounds('a very long value', 2)).toEqual({ maxX: 51.5, maxY: 5, minX: -1.5, minY: -5 });
  });

  it('should return nothing when the text has no glyphs', () => {
    // mock
    boundsMock.mockReturnValue(null);

    // result
    expect(getGridTrackValueEditBounds('', 1)).toBeNull();
  });
});
